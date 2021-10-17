<template>
  <div v-if="user !== null" id="full-screen">
    <div class="welcome-msg">
      <span class="text-dark d-block mb-2">Good morning, {{ user.displayName }}!</span>
      <p id="date" class="text-gray">Today is {{ dateCurrent() }}</p>
      <create-join-popover></create-join-popover>
    </div>
    <!-- Centered Empty Dashboard Placeholder -->
    <div v-if="studyGroups && studyGroups.length > 0">
      <p id="group-header">Ваши группы:</p>
      <div class="studyGroups">
        <router-link
          v-for="(group, index) in studyGroups"
          :key="index"
          class="group-card"
          :to="{ name: 'home', params: { groupID: group.id } }"
        >
          <div id="name">{{ group.className }}</div>
          <div>
            Start in - {{ group.meetingDays[0] }}
          </div>
          <div id="professor">{{ group.instructorName }}</div>
        </router-link>
      </div>
    </div>
    <div v-else>
      <div class="empty">
        <div class="empty-icon">
          <img
            id="undraw"
            class="undraw-svg"
            src="@/assets/undraw_no_data.svg"
            alt="Нет групп"
          />
          <p class="empty-title h5 text-warning">
            Ви поки що не маєте своїх груп 😞
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="loading loading-lg"></div>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig';
import { getUserData } from '@/scripts/userFuncs';
import CreateJoinPopover from '@/components/navigation/CreateJoinPopover';
import { format } from 'date-fns';

export default {
  name: 'Dashboard',
  components: {
    CreateJoinPopover,
  },
  data() {
    return {
      user: null,
      studyGroups: [],
      newGroupID: '',
      date: new Date(),
    };
  },
  methods: {
    dateCurrent() {
      const date = this.date;
      return format(date, 'HH:mm dddd, MMMM Do, YYYY');
    },
  },
  created() {
    getUserData(this.$store.getters.uid)
      .then((user) => {
        this.user = user;
      })
      .catch((error) => {
        console.log(error);
      });
    this.$bind(
      'studyGroups',
      db
        .collection('study-groups')
        .where('members', 'array-contains', this.$store.getters.uid)
    ).then((studyGroups) => {
      this.studyGroups === studyGroups;
      // console.log(this.studyGroups);
    });
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.welcome-msg {
  font-size: 300%;
  margin: 20px;
  span {
    color: white;
  }
  #date {
    font-size: 75%;
    font-family: $secondary-font;
  }
}
#undraw {
  width: 10em;
}
#full-screen {
  height: $content-height;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: space-between;
  background: #fff;
  color: $secondary-light;
}
.empty {
  background-color: transparent;
}
.studyGroups {
  display: flex;
  flex-direction: row;
  width: 50%;
  margin: auto;
  align-items: center;
  justify-content: center;
}
.group-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  color: $dark;
  padding: 10px;
  box-shadow: $shadow;
  margin: 10px;
  min-width: 250px;
  height: 150px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  border: 1px solid #000;
  border-radius: 10px;
  #name {
    font-weight: bold;
    font-size: 125%;
    margin: 0px;
    padding: 0px;
  }
  #professor {
    font-family: $secondary-font;
    font-size: 100%;
  }
  &:hover {
    box-shadow: $shadow-heavy;
    transform: scale(1.03);
  }
}
#group-header {
  padding-top: 100px;
  font-size: 20px;
  text-transform: uppercase;
  color: #fff;
  font-weight: 700;
}
</style>
