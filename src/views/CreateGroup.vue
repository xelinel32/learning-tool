<template>
  <div id="full-screen">
    <!-- Page Title -->
    <page-title>
      <template slot="center">Создать новую учебную группу</template>
    </page-title>

    <div class="create-content">
      <!-- Contains Center Content; Buttons and Content -->
      <div class="nav-container">
        <!-- Back Button -->
        <button
          class="btn btn-action btn-success btn-lg"
          :class="active === 0 ? 'disabled c-not-allowed' : ''"
          @click="back"
        >
          <i class="fas fa-arrow-left"></i>
        </button>

        <!-- Class Name Card -->
        <div v-if="active === 0" class="infoContainer">
          <h2>Название класса</h2>
          <div class="form-group">
            <input
              v-model="className"
              class="form-input"
              type="text"
              placeholder="Название группы"
              name="className"
              required
              @keydown.enter="next"
            />
          </div>
          <h3 style="margin-top: 20px;">Код курса?</h3>
          <input
            v-model="courseCode"
            class="form-input"
            type="text"
            style="width: 200px;"
            placeholder="Код курса"
            @keydown.enter="next"
          />
        </div>

        <!-- Instructor Name Form -->
        <div v-else-if="active === 1" class="infoContainer">
          <h2>Как зовут преподавателя курса</h2>
          <div class="form-group">
            <input
              v-model="instructorName"
              class="form-input"
              type="text"
              placeholder="Имя преподавателя"
              name="instructor"
              required
              @keydown.enter="next"
            />
          </div>
        </div>

        <!-- Class Meeting Time Form -->
        <div v-else-if="active === 2" class="infoContainer">
          <h2>Время провождения курса?</h2>

          <!-- Day Selector Button Block -->
          <div class="btn-group btn-group-block">
            <button
              :class="meetingDays.monday ? 'active' : ''"
              class="btn"
              @click="toggle('monday')"
            >
              Понедельник
            </button>
            <button
              :class="meetingDays.tuesday ? 'active' : ''"
              class="btn"
              @click="toggle('tuesday')"
            >
              Вторник
            </button>
            <button
              :class="meetingDays.wednesday ? 'active' : ''"
              class="btn"
              @click="toggle('wednesday')"
            >
              Среда
            </button>
            <button
              :class="meetingDays.thursday ? 'active' : ''"
              class="btn"
              @click="toggle('thursday')"
            >
              Четверг
            </button>
            <button
              :class="meetingDays.friday ? 'active' : ''"
              class="btn"
              @click="toggle('friday')"
            >
              Пятница
            </button>
          </div>

          <br />
          <div class="time-group">
            <flat-pickr
              v-model="meetingTime[0]"
              :config="config"
              class="time-picker form-input"
              style="margin-right: 10px;"
              placeholder="Time"
              required
            />
            <p>до</p>
            <flat-pickr
              v-model="meetingTime[1]"
              :config="config"
              class="time-picker form-input"
              style="margin-left: 10px;"
              placeholder="Time"
              required
            />
          </div>
        </div>

        <!-- Class Meeting Location Form -->
        <div v-else-if="active === 3" class="infoContainer">
          <h2>Место прохождения курсов (Адрес)</h2>

          <input
            v-model="location"
            class="form-input"
            style="width: 60%;"
            type="text"
            name="location"
            placeholder="Адрес"
            @keydown.enter="next"
          />
        </div>

        <!-- Instructor Website Form -->
        <div v-else-if="active === 4" class="infoContainer">
          <h2>Есть ли у вас веб-сайт?</h2>

          <div class="form-group switch">
            <label class="form-switch">
              <input v-model="hasWebsite" type="checkbox" />
              <i class="form-icon"></i>
            </label>
          </div>
          <br />
          <transition-group
            name="transition"
            enter-active-class="animated fadeInDown"
            leave-active-class="animated fadeOutUp"
          >
            <div v-show="hasWebsite" key="input" class="input-group">
              <span class="input-group-addon">https://</span>
              <input
                v-model="websiteURL"
                style="margin: 0;"
                class="form-input"
                type="text"
                name="url"
                placeholder="url"
                @keydown.enter="next"
              />
            </div>
            <br key="break" />
            <br key="break2" />
            <a
              v-show="hasWebsite && websiteURL !== ''"
              key="link"
              target="_blank"
              :href="formattedURL"
              >{{ formattedURL }}</a
            >
          </transition-group>
        </div>

        <!-- Extra Group Info Form -->
        <div v-else-if="active === 5" class="infoContainer">
          <h2>Хотите ли вы ввести дополнительную информацию?</h2>
          <div class="form-group switch">
            <label class="form-switch">
              <input v-model="hasExtraInfo" type="checkbox" />
              <i class="form-icon"></i>
            </label>
          </div>
          <br />
          <div v-show="hasExtraInfo" key="input" class="input-group">
            <transition
              name="transition"
              enter-active-class="animated fadeInDown"
              leave-active-class="animated fadeOutUp"
            >
              <textarea
                v-show="hasExtraInfo"
                v-model="extraInfo"
                style="resize: none"
                class="form-input"
                type="text-area"
                cols="53"
                rows="3"
                placeholder="Дополнительная информация о классе"
                @keydown.enter="next"
              ></textarea>
            </transition>
          </div>
        </div>

        <!-- Create Group with previous data confirmation -->
        <div v-else-if="active === 6" class="infoContainer">
          <button class="createBtn" @click="createStudyGroup">
            Создать группу
          </button>
        </div>

        <!-- Invite Code / New Group Links -->
        <div v-else-if="active === 7" class="infoContainer">
          <h3>Ваш класс был создан!</h3>
          <div style="width: 50%; margin: 20px auto;" class="input-group">
            <input
              ref="inviteDisplay"
              v-model="inviteCode"
              type="text"
              class="form-input"
              placeholder="Код приглашения"
              style="margin: 0;"
            />
            <button class="btn btn-primary input-group-btn" @click="copyCode">
              Скопировать код
            </button>
          </div>
          <div id="btnContainer">
            <router-link class="btn" :to="{ name: 'dashboard' }"
              >Доска</router-link
            >
            <router-link
              style="margin: 0px 10px;"
              class="btn btn-success"
              :to="{ name: 'home', params: { groupID: newGroupID } }"
              >Перейти к группе</router-link
            >
          </div>
        </div>

        <!-- Next Button -->
        <button
          class="btn btn-action btn-success btn-lg"
          :class="active === 7 ? 'disabled' : ''"
          @click="next"
        >
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>

      <steps :active="active" />
    </div>
  </div>
</template>

<script>
import firebase, { db } from '@/firebaseConfig';
import generateCode from '@/scripts/generateCode';
import PageTitle from '@/components/navigation/PageTitle';
import Steps from '@/components/create/Steps';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Russian } from 'flatpickr/dist/l10n/ru';
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';

export default {
  name: 'CreateGroup',
  components: {
    PageTitle,
    flatPickr,
    Steps,
  },
  data() {
    return {
      active: 0,
      config: {
        locale: Russian,
        dateFormat: 'H:i',
        time_24hr: true,
        enableTime: true,
        noCalendar: true,
        plugins: [new ConfirmDatePlugin()],
      },
      className: '',
      courseCode: '',
      instructorName: '',
      location: '',
      hasWebsite: false,
      websiteURL: '',
      hasExtraInfo: false,
      extraInfo: '',
      meetingDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
      },
      meetingTime: [new Date(), new Date()],
      inviteCode: '',
      newGroupID: '',
    };
  },
  computed: {
    formattedURL() {
      return 'https://' + this.websiteURL;
    },
  },
  methods: {
    toggle(key) {
      this.meetingDays[key] = !this.meetingDays[key];
    },
    next() {
      this.active++;
    },
    back() {
      this.active--;
    },
    copyCode() {
      // Allows user to copy the invite code on button click
      this.$refs.inviteDisplay.select();
      document.execCommand('copy');
    },
    getDaysArray() {
      let arr = [];
      Object.keys(this.meetingDays).forEach((key) => {
        if (this.meetingDays[key] === true) {
          arr.push(key.charAt(0).toUpperCase() + key.slice(1));
          // console.log(arr);
        }
      });
      return arr;
    },
    createStudyGroup() {
      // Generate random invite code and save it
      this.inviteCode = generateCode();
      // Create new study group in the firestore
      db.collection('study-groups')
        .add({
          className: this.className,
          courseCode: this.courseCode,
          instructorName: this.instructorName,
          meetingDays: this.getDaysArray(),
          meetingTime: this.meetingTime,
          location: this.location,
          websiteURL:
            this.websiteURL === '' ? '' : 'https://' + this.websiteURL,
          extraInfo: this.extraInfo,
          owner: firebase.auth().currentUser.uid,
          members: [firebase.auth().currentUser.uid],
          inviteCodes: [this.inviteCode],
        })
        .then((docRef) => {
          this.newGroupID = docRef.id;
          this.next();
        })
        // Catch error when creating Study Group
        .catch((error) => {
          console.log('CreateGroup: ' + error);
        });
      console.log(this.meetingDays);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#full-screen {
  height: $content-height;
}
button.btn-action {
  margin: 15px;
}
.create-content {
  height: $page-with-header-height;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.nav-container {
  display: flex;
  flex-flow: row nowrap;
  place-content: center;
  justify-content: center;
  align-items: center;
}
.infoContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 400px;
  width: 800px;
  background-color: white;
  &:hover {
    box-shadow: $shadow-hovered;
  }
}
.createBtn {
  cursor: pointer;
  background-color: $primary;
  box-shadow: $shadow;
  width: 300px;
  padding: 20px;
  font-family: $logo-font;
  font-size: 30px;
  color: white;
  border: 0;
  &:hover {
    box-shadow: $shadow-heavy;
  }
}
.time-group {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
.time-picker {
  width: 100px;
}
input {
  margin-top: 15px;
  margin-left: auto;
  margin-right: auto;
}
p {
  margin: 0;
  margin-top: 10px;
}
textarea {
  width: 60%;
}
.arrow-buttons {
  margin: 20px;
}
.blocked {
  cursor: not-allowed !important;
}
.switch {
  margin: 0 auto 20px auto;
  width: 50px;
}
</style>
