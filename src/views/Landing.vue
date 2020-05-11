<template>
  <div class="landing">
    <!-- Header Section -->
    <header class="navbar">
      <section class="navbar-section">
        <span class="logo__name">Learning App</span>
      </section>

      <!-- Login Form -->
      <form
        class="hide-sm hide-xs navbar-section login-container form-group"
        method=""
        data-vv-scope="login"
        @submit.prevent
      >
        <input
          ref="email"
          v-model="email"
          v-validate.disable="'required|email'"
          name="email"
          placeholder="Email"
          type="text"
          class="form-input form-inline mx-1"
          autofocus
          autocomplete="off"
        />
        <input
          v-model="password"
          v-validate.disable="'required|min:6'"
          name="password"
          placeholder="Пароль"
          type="password"
          class="form-input form-inline mx-1"
          autocomplete="off"
        />
        <button id="loginButton" class="btn btn-success m-1" @click="logIn">
          Войти
        </button>
      </form>
    </header>

    <!-- Sucess Message Display -->
    <transition
      name="transition"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <MessageBar v-show="message.show" type="success">
        {{ message.message }}
      </MessageBar>
    </transition>

    <!-- Error Message Display -->
    <transition
      name="transition"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <MessageBar
        v-show="error.show"
        id="errorMessage"
        type="error"
        @closeMessage="error.show = false"
      >
        {{ error.message }}
        <a
          v-show="error.passPrompt"
          href="#"
          style="cursor: pointer"
          @click="modalActive = true"
          >Забыли пароль?</a
        >
      </MessageBar>
    </transition>
    <!-- Password Reset Modal -->
    <div v-show="modalActive" id="modal-id" class="modal modal-sm active">
      <a
        href="#"
        class="modal-overlay"
        aria-label="Close"
        @click="modalActive = false"
      ></a>
      <div class="modal-container">
        <div class="modal-header">
          <a
            href="#"
            class="btn btn-clear float-right"
            aria-label="Close"
            @click="modalActive = false"
          ></a>
          <div class="modal-title h5">Введите ваш email</div>
        </div>
        <div class="modal-body">
          <div class="content">
            <input
              v-model="resetEmail"
              value="email"
              type="text"
              class="form-input"
              autofocus
              @focus="$event.target.select()"
              placeholder="example@mail.com"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary m-1" @click="sendResetEmail">
            Восстановить
          </button>
        </div>
      </div>
    </div>

    <div class="columns body-container">
      <!-- Right Block: Sign Up Form -->
      <div class="column col-6 col-sm-12 col-md-12 hide-xs hide-sm">
        <div id="right-container form-group">
          <form data-vv-scope="signup" @submit.prevent>
            <h1>Регистация</h1>
            <span id="name-container">
              <input
                v-model.trim="firstName"
                v-validate.disable="'required|alpha'"
                class="form-input"
                type="text"
                name="firstname"
                placeholder="Имя"
              />
              <input
                v-model.trim="lastName"
                v-validate.disable="'required|alpha'"
                class="form-input"
                type="text"
                name="lastname"
                placeholder="Фамилия"
              />
            </span>
            <br />
            <input
              v-model="newEmail"
              v-validate.disable="'required|email'"
              type="text"
              class="form-input"
              name="email"
              placeholder="Email"
            /><br />
            <input
              v-model="newPassword"
              v-validate.disable="'required|min:6'"
              class="form-input"
              type="password"
              name="password"
              placeholder="Пароль"
            /><br />
            <button class="btn btn-primary mx-1" @click="createAccount">
              Регистация
            </button>
            <button class="btn mx-1" @click="googleSignIn">
              <i class="fab fa-google"></i>
              Войти с Google
            </button>
          </form>
        </div>
      </div>
    </div>

    <div class="show-xs show-sm">
      <p>К сожелению, <i>Learning App</i> доступен только для пк версии</p>
      <p>Что бы войти, зайдите с компютера</p>
    </div>
  </div>
</template>

<script>
import firebase, { db, FirebaseConsts } from '@/firebaseConfig';
import MessageBar from '@/components/MessageBar';

export default {
  name: 'Landing',
  components: {
    MessageBar,
  },
  data() {
    return {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      newEmail: '',
      newPassword: '',
      resetEmail: '',
      error: {
        show: false,
        message: '',
        passPrompt: false,
      },
      message: {
        show: false,
        message: '',
      },
      modalActive: false,
    };
  },
  computed: {
    centerTitle() {
      if (window.innerWidth <= 600) {
        return { width: '100%' };
      }
      return {};
    },
  },
  methods: {
    logIn() {
      // Attempt to log in
      this.$validator.validateAll('login').then((result) => {
        if (!result) {
          // there is a validation error, display them in order
          if (this.errors.has('login.email')) {
            this.error.message = this.errors.first('login.email');
          } else if (this.errors.first('login.password')) {
            this.error.message = this.errors.first('login.password');
          }
          this.error.show = true;
          this.error.passPrompt = true;
        } else {
          firebase
            .auth()
            .setPersistence(FirebaseConsts.auth.Auth.Persistence.LOCAL)
            .then(() => {
              firebase
                .auth()
                .signInWithEmailAndPassword(this.email, this.password)
                .then((user) => {
                  this.$store.commit('setUID', user.user.uid);
                  this.$router.replace('dashboard');
                })
                .catch((error) => {
                  this.error.show = true;
                  this.error.passPrompt = true;
                  this.error.message = error.message;
                });
            })
            .catch((error) => {
              this.error.show = true;
              this.error.passPrompt = true;
              this.error.message = error.message;
            });
        }
      });
    },
    createAccount() {
      // Attempt to create an account
      this.$validator.validateAll('signup').then((result) => {
        if (!result) {
          if (this.errors.first('signup.firstname')) {
            this.error.message = this.errors.first('signup.firstname');
            console.log(this.error);
          } else if (this.errors.first('signup.lastname')) {
            this.error.message = this.errors.first('signup.lastname');
          } else if (this.errors.first('signup.email')) {
            this.error.message = this.errors.first('signup.email');
          } else if (this.errors.first('signup.password')) {
            this.error.message = this.errors.first('signup.password');
          }
          this.error.show = true;
          this.error.passPrompt = false;
        } else {
          firebase
            .auth()
            .setPersistence(FirebaseConsts.auth.Auth.Persistence.LOCAL)
            .then(() => {
              var fullName = this.firstName + ' ' + this.lastName;
              firebase
                .auth()
                .createUserWithEmailAndPassword(this.newEmail, this.newPassword)
                .then((authUser) => {
                  authUser.user
                    .updateProfile({
                      displayName: fullName,
                    })
                    .then(() => {
                      //redirect to the dashboard
                      this.newUserToStore(authUser.user);
                      this.$router.replace('dashboard');
                    })
                    .catch((error) => {
                      this.error.show = true;
                      this.error.passPrompt = false;
                      this.error.message = error.message;
                    });
                })
                .catch((error) => {
                  this.error.show = true;
                  this.error.passPrompt = false;
                  this.error.message = error.message;
                });
            });
        }
      });
    },
    googleSignIn() {
      let provider = new FirebaseConsts.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          if (result.user) {
            this.newUserToStore(result.user);
            this.$router.replace('dashboard');
          }
        })
        .catch((error) => {
          this.error.show = true;
          this.error.passPrompt = false;
          this.error.message = error.message;
        });
    },
    sendResetEmail() {
      this.error.show = false;
      this.modalActive = false;
      firebase
        .auth()
        .sendPasswordResetEmail(this.resetEmail)
        .then(() => {
          this.message.show = true;
          this.message.message =
            'Письмо с инструкциями по сбросу пароля было отправлено  ' +
            this.resetEmail;
        })
        .catch((error) => {
          this.error.show = true;
          this.error.passPrompt = false;
          this.error.message = error.message;
        });
    },
    newUserToStore(userAccount) {
      db.collection('users')
        .doc(userAccount.uid)
        .set({
          uid: userAccount.uid,
          displayName: userAccount.displayName,
          photoURL: userAccount.photoURL,
          description: null,
          studyGroups: [],
          sidebarOpen: true,
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';
h1 {
  font-size: 30px;
}
p {
  font-size: 1.5em;
}
.modal-footer {
  display: flex;
  justify-content: center;
}
.body-container {
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.column input {
  width: 25em;
  margin: auto;
}
#right-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#name-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 25em;
  margin: auto;
}
#name-container input {
  width: 48%;
  margin: 0;
}
.navbar {
  background-color: $dark;
  padding: 0px 10px;
  height: 64px;
}
.navbar-section input {
  width: 35%;
}
.navbar-section {
  .logo__name {
    font-size: 24px;
    color: #fff;
    font-family: $logo-font;
    margin-left: 25px;
    i {
      color: chartreuse;
    }
  }
}
.navbar-brand {
  font-family: 'Pacifico', cursive;
  font-size: 2em;
  color: white;
}
#logo {
  font-family: 'Pacifico', cursive;
  font-size: 40px;
}
.landing {
  height: 100vh;
  background: #ffffff;
}
</style>
