<template>
  <div class="modal modal-md active">
    <a
      href="#close"
      class="modal-overlay"
      aria-label="Close"
      @click="closeAndReset"
    ></a>

    <div class="modal-container">
      <div class="modal-header">
        <a
          id="close"
          href="#close"
          class="btn btn-clear float-right"
          aria-label="Close"
          @click="closeAndReset"
        >
        </a>

        <div class="modal-title h4">Profile setup</div>
      </div>
      <div class="modal-body">
        <ul class="tab">
          <li
            class="tab-item"
            :class="[activeTab === 1 ? 'active' : '']"
            @click="activeTab = 1"
          >
            <a>Profile</a>
          </li>
          <li
            class="tab-item"
            :class="[activeTab === 2 ? 'active' : '']"
            @click="activeTab = 2"
          >
            <a>Account</a>
          </li>
          <li
            class="tab-item"
            :class="[activeTab === 3 ? 'active' : '']"
            @click="activeTab = 3"
          >
            <a>My groups</a>
          </li>
        </ul>

        <!-- Tab One Content -->
        <div v-if="activeTab === 1">
          <div class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">Username</div>
              <div class="tile-subtitle">
                <input
                  v-model="profileDetails.newName"
                  class="form-input"
                  type="text"
                  :placeholder="user.displayName"
                />
              </div>
            </div>
          </div>
          <div class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">Profile photo</div>
              <div class="tile-subtitle">
                Upload a new photo:
                <input
                  id=""
                  class="form-input form-inline"
                  style="width: 300px;"
                  accept="image/*"
                  type="file"
                  name=""
                  @change="handleFile($event)"
                />
              </div>
            </div>
          </div>
          <div class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">Description</div>
              <div class="tile-subtitle">
                <textarea
                  v-model="profileDetails.newBio"
                  name="bio"
                  rows="3"
                  style="resize: none;"
                  :placeholder="userBio"
                  @keydown.ctrl.enter="saveChanges"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Two Content -->
        <div v-else-if="activeTab === 2 && !didReauth && !isGoogleAccount">
          <div class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">
                Enter a current password for changing password...
              </div>
              <div id="input-button-container" class="tile-subtitle">
                <input
                  v-model="reauth.password"
                  class="form-input"
                  type="password"
                  placeholder="Ваш пароль"
                />
                <button class="btn btn-success" @click="reauthenticateUser">
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- This content shows once the user has reauthenticated -->
        <div v-else-if="activeTab === 2 && didReauth == true">
          <div v-if="!isGoogleAccount" class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">Изменить Email</div>
              <div id="input-button-container" class="tile-subtitle">
                <input
                  v-model="newCreds.email"
                  class="form-input form-inline"
                  type="text"
                  :placeholder="user.email"
                />
                <button
                  class="btn btn-success form-inline"
                  @click="updateEmail"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
          <div v-if="!isGoogleAccount" class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold">Change a password</div>
              <div id="input-button-container" class="tile-subtitle">
                <input
                  v-model="newCreds.password"
                  class="form-input"
                  type="password"
                  placeholder="Новый пароль"
                />

                <button class="btn btn-success" @click="updatePassword">
                  Change
                </button>
              </div>
            </div>
          </div>
          <div class="tile">
            <div class="tile-content text-left">
              <div class="tile-title text-bold text-center">
                Delete a profile
              </div>
              <div class="tile-subtitle delete-container">
                <button class="btn btn-error" @dblclick="deleteAccount">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Three Content -->
        <div v-else-if="activeTab === 3">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Name of the group</th>
                <th>Mmembers</th>
                <th class="text-center">Leave group</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(group, index) in groupList" :key="index">
                <td>{{ group.className }}</td>
                <td>{{ group.membersLength }}</td>
                <td class="button-td">
                  <button
                    class="btn btn-error"
                    @click="leaveGroup(group.groupID)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <button
          v-if="activeTab !== 3 && activeTab !== 2"
          class="save-btn btn btn-primary"
          @click="saveChanges"
        >
          Save current chnages
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserData, getUserGroups } from '@/scripts/userFuncs';
import firebase, { FirebaseConsts, Storage, db } from '@/firebaseConfig';

let picRef = Storage.ref();

export default {
  name: 'ProfileSettings',
  props: {
    user: {
      type: Object,
      default: null,
    },
    photoURL: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // Only show certain settings if not using google sign in
      isGoogleAccount: false,
      studyGroups: [],
      didReauth: false,
      newCreds: {
        email: '',
        password: '',
      },
      reauth: {
        password: '',
      },
      activeTab: 1,
      profileDetails: {
        newName: '',
        newPhoto: null,
        newBio: '',
      },
      groupList: [],
      userBio: '',
    };
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 3) {
        this.loadGroups();
      }
    },
  },
  beforeMount() {
    // Load the user's description from firestore
    getUserData(this.user.uid)
      .then((user) => {
        this.userBio = user.description;
      })

    this.loadGroups();

    this.user.providerData.forEach((profile) => {
      if (profile.providerId === 'google.com') {
        this.isGoogleAccount = true;
        this.didReauth = true;
      }
    });
  },
  created() {
    this.$bind(
      'studyGroups',
      db
        .collection('study-groups')
        .where('members', 'array-contains', this.$store.getters.uid)
    ).then((studyGroups) => {
      this.studyGroups === studyGroups;
    });
  },
  methods: {
    async deleteAccount() {
      const userId = this.user.uid;
      await firebase.auth().currentUser.delete();
      await db
        .collection('users')
        .doc(userId)
        .delete();
    },
    updateEmail() {
      this.user
        .updateEmail(this.newCreds.email)
        .then(function() {
          // Update successful.
          // console.log('Email updated');
        })
    },

    updatePassword() {
      this.user
        .updatePassword(this.newCreds.password)
        .then(function() {
          // Update successful.
          // console.log('Password updated');
        })
    },
    reauthenticateUser() {
      let credential;

      credential = FirebaseConsts.auth.EmailAuthProvider.credential(
        this.user.email,
        this.reauth.password
      );

      // Reauthenticate user based on the credential
      this.user
        .reauthenticateAndRetrieveDataWithCredential(credential)
        .then(() => {
          // User re-authenticated.
          // console.log('Successful pass');
          this.didReauth = true;
        })
    },
    closeAndReset() {
      this.activeTab = 1;
      this.$emit('closeSettings');
    },
    loadGroups() {
      getUserGroups(this.user.uid)
        .then((groupList) => {
          this.groupList = groupList;
        })
    },
    leaveGroup(id) {
      // Remove the user from members list of specific study group
      db.collection('study-groups')
        .doc(id)
        .update({
          members: FirebaseConsts.firestore.FieldValue.arrayRemove(
            this.$store.getters.uid
          ),
        });
      this.loadGroups();
      this.$router.push({ name: 'dashboard' });
    },
    saveChanges() {
      if (this.activeTab === 1) {
        if (
          this.profileDetails.newName !== this.user.displayName &&
          this.profileDetails.newName !== ''
        ) {
          // Update the user's auth account
          this.user.updateProfile({
            displayName: this.profileDetails.newName,
          });

          // Update the firestore doc for the user
          db.collection('users')
            .doc(this.$store.getters.uid)
            .update({
              displayName: this.profileDetails.newName,
            });
        }

        if (this.profileDetails.newPhoto !== null) {
          // Set metadata for image
          var metadata = {
            contentType: 'image/jpeg',
          };

          let path = 'profile-pictures/' + this.user.uid;

          // Upload new picture
          picRef
            .child(path)
            .put(this.profileDetails.newPhoto, metadata)
            .then(() => {
              picRef
                .child(path)
                .getDownloadURL()
                .then((url) => {
                  this.user.updateProfile({
                    photoURL: url,
                  });

                  db.collection('users')
                    .doc(this.user.uid)
                    .update({
                      photoURL: url,
                    });
                });
            });
        }

        // Create new profile bio in firestore
        if (this.profileDetails.newBio !== '') {
          db.collection('users')
            .doc(this.user.uid)
            .update({
              description: this.profileDetails.newBio,
            });
        }

        this.closeAndReset();
      }
    },
    handleFile(event) {
      this.profileDetails.newPhoto = event.target.files[0];
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#input-button-container {
  display: flex;
  flex-flow: row nowrap;
  input {
    margin-right: 20px;
  }
}
.delete-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  button {
    width: 150px;
  }
}
.modal-container {
  #close {
    color: $secondary;
    i {
      font-size: 24px;
    }
    &:hover {
      color: darken($secondary, 5);
    }
    &:focus {
      outline: none;
    }
  }
}
textarea {
  width: 100%;
}
.modal-header {
  margin: 15px 15px 0 15px;
}
.modal-title {
  font-family: $secondary-font;
  font-weight: 700;
}
.tile-title {
  margin-top: 15px;
  margin-bottom: 5px;
  font-family: $secondary-font;
}
.tab-item {
  cursor: pointer;
  color: $secondary-light;
  a:hover {
    color: $secondary !important;
  }
  &.active {
    font-weight: 700;
  }
}
.button-td {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  .btn {
    width: 40px;
  }
}
</style>
