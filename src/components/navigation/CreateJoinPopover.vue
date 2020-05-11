<template>
  <div>
    <notifications group="joinErrors" position="bottom left" />

    <div class="group__buttons">
      <button
        id="create-button"
        class="btn btn-success btn-create"
        @click="$router.push('/dashboard/create')"
      >
        Новая группа
      </button>

      <div class="empty-action input-group input-inline group__code">
        <input
          v-model="inviteCode"
          class="form-input"
          placeholder="Код приглашения"
          type="text"
          @keydown.enter="fetchStudyGroup"
        />
        <button class="btn btn-error input-group-btn" @click="fetchStudyGroup">
          Войти
        </button>
      </div>
    </div>

    <!-- Class Join Confirmation Modal -->
    <div v-if="showModal && inviteGroup !== null" class="modal modal-sm active">
      <a
        href="#close"
        class="modal-overlay"
        aria-label="Close"
        @click="showModal = false"
      ></a>
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5">
            Курс - <span class="text-error">{{ inviteGroup.className }}</span>
          </div>
        </div>
        <div class="modal-body">
          <div class="h5 text-center text-dark">
            Руководитель:
            <span class="text-primary"> {{ inviteGroup.instructorName }}</span>
          </div>
          <div class="h5 text-center text-dark">
            Участников - {{ inviteGroup.members.length }}
          </div>
        </div>
        <div class="modal-footer">
          <button
            id="cancel-btn"
            class="btn btn-link"
            @click="showModal = false"
          >
            Отмена
          </button>
          <button
            class="btn btn-primary"
            :class="isLoading ? 'loading' : ''"
            @click="joinStudyGroup"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, FirebaseConsts } from '@/firebaseConfig';

export default {
  name: 'CreateJoinPopover',
  data() {
    return {
      inviteCode: '',
      // Show/Hide the confirmation modal
      showModal: false,
      // The returned group's detail data
      inviteGroup: null,
      isLoading: false,
    };
  },
  methods: {
    joinStudyGroup() {
      this.isLoading = true;
      db.collection('study-groups')
        .doc(this.newGroupID)
        .update({
          members: FirebaseConsts.firestore.FieldValue.arrayUnion(
            this.$store.getters.uid
          ),
        })
        .then(() => {
          this.showModal = false;
          this.isLoading = false;
          this.$router.push(`/${this.newGroupID}/home`);
        });
    },
    // Search all study groups to find a matching group for the invite code
    fetchStudyGroup() {
      if (this.inviteCode !== '') {
        db.collection('study-groups')
          .where('inviteCodes', 'array-contains', this.inviteCode)
          .limit(1)
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.size !== 0) {
              querySnapshot.forEach((doc) => {
                this.newGroupID = doc.id;
              });
              return true;
            } else {
              return false;
            }
          })
          .then((groupFound) => {
            if (groupFound) {
              db.collection('study-groups')
                .doc(this.newGroupID)
                .get()
                .then((doc) => {
                  this.inviteGroup = doc.data();
                  // Check if the group already contains the user
                  if (
                    !this.inviteGroup.members.includes(this.$store.getters.uid)
                  ) {
                    this.showModal = true;
                  } else {
                    this.$notify({
                      group: 'joinErrors',
                      type: 'warning',
                      title: 'Невозможно присоединиться к учебной группе',
                      text:
                        'Вы уже являетесь участником ' +
                        this.inviteGroup.className,
                    });
                  }
                  // Reset input field after clicking join button
                  this.inviteCode = '';
                });
            } else {
              this.$notify({
                group: 'joinErrors',
                type: 'error',
                title: 'Группа не найдена',
                text: 'Групп по такому коду не найдено.',
              });
              // Reset input field after clicking join button
              this.inviteCode = '';
            }
          });
      } else {
        this.$notify({
          group: 'joinErrors',
          type: 'error',
          title: 'Неверный код',
          text: 'Введите корректный код',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.group__buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  .btn-create {
    margin-right: 20px;
  }
  .group__code {
    display: flex;
  }
}
.popover-container {
  .card {
    background-color: $transparent-dark;
    color: white;
  }
}
hr {
  background-image: $orange-gradient;
  height: 1px;
  border: none;
}
.section-title {
  text-align: center;
  padding-bottom: 2%;
}
#cancel-btn {
  margin-right: 10px;
  color: $error-color;
}
#button {
  background-color: $transparent-dark;
  color: white;
  border: solid 2px $primary;
  &:hover {
    background-color: white;
    color: $primary;
  }
}
</style>
