<template>
  <div>
    <!-- Notification displays when a new code is generated -->
    <notifications group="generateInvite" position="left top" />
    <page-title>
      <template slot="left">
        <button class="btn btn-primary" @click="inviteMember()">
          Invite <i class="fas fa-plus"></i>
        </button>
      </template>
      <template slot="center">Members</template>
    </page-title>
    <div
      v-if="!loading"
      style="display: flex; flex-flow: row nowrap; justify-content: center;"
    >
      <!-- Display card for each member of the Study Group -->
      <transition-group
        name="transition"
        enter-active-class="animated pulse"
        leave-active-class="animated fadeOut"
        appear
        class="content-container"
      >
        <!-- Show card for each group member -->
        <member-card
          v-for="member in memberDetails"
          :key="member.uid"
          :photo-u-r-l="member.photoURL"
          :display-name="member.displayName"
          :description="member.description"
          :owner="member.uid === studyGroup.owner"
        >
        </member-card>
      </transition-group>
    </div>
    <div v-else class="loading loading-lg"></div>

    <!-- Display Invite Code Modal -->
    <div v-show="displayModal" id="modal-id" class="modal modal-sm active">
      <a
        href="#"
        class="modal-overlay"
        aria-label="Close"
        @click="displayModal = false"
      ></a>
      <div class="modal-container">
        <div class="modal-header">
          <a
            href="#"
            class="btn btn-clear float-right"
            aria-label="Close"
            @click="displayModal = false"
          ></a>
          <div class="modal-title h5">Generate a code</div>
        </div>
        <div class="modal-body">
          <div class="content">
            <div class="input-group">
              <input
                ref="invite"
                v-model="inviteCode"
                type="text"
                class="form-input"
              />
              <button class="btn btn-primary input-group-btn" @click="copyCode">
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from '@/components/navigation/PageTitle';
import MemberCard from '@/components/MemberCard';
import { db, FirebaseConsts } from '@/firebaseConfig';
import { getGroupData } from '@/scripts/groupFuncs';
import generateCode from '@/scripts/generateCode';

export default {
  name: 'MembersPage',
  components: {
    PageTitle,
    MemberCard,
  },
  data() {
    return {
      loading: true,
      memberDetails: [],
      displayModal: false,
      inviteCode: '',
      studyGroup: null,
    };
  },
  created() {
    // Load initial group data and save it
    getGroupData(this.$route.params.groupID)
      .then((group) => {
        this.studyGroup = group;
      })
      .catch((error) => {
        console.log(error);
      });
    db.collection('study-groups')
      .doc(this.$route.params.groupID)
      .onSnapshot((snapshot) => {
        this.studyGroup = snapshot.data();
        this.getMemberInfo();
      });
  },
  methods: {
    copyCode() {
      // When a user copies the code, the code is saved to firebase
      db.collection('study-groups')
        .doc(this.$route.params.groupID)
        .update({
          inviteCodes: FirebaseConsts.firestore.FieldValue.arrayUnion(
            this.inviteCode
          ),
        })
        .then(() => {
          this.$notify({
            group: 'generateInvite',
            type: 'success',
            title: 'Incorrect had generated code',
            text: 'Code copied to buffer',
          });
        });
      this.$refs.invite.select();
      document.execCommand('copy');
    },
    inviteMember() {
      this.inviteCode = generateCode();
      this.displayModal = true;
    },
    getMemberInfo() {
      let counter = this.studyGroup.members.length;
      this.memberDetails = [];
      this.studyGroup.members.forEach((uid) => {
        db.collection('users')
          .where('uid', '==', uid)
          .limit(1)
          .get()
          .then((docSnapshot) => {
            if (docSnapshot.size == 1) {
              counter--;
              this.memberDetails.push(docSnapshot.docs[0].data());
              if (counter == 0) {
                this.loading = false;
              }
            }
          });
      });
      // console.log(this.memberDetails);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';
.modal-container {
  border-radius: 10px;
  .modal-title {
    font-family: $secondary-font;
    font-weight: 700;
  }
}
.content-container {
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 300px));
  grid-auto-rows: 300px;
  justify-content: center;
  padding: 20px;
  transition: all 350ms ease-in;
}
</style>
