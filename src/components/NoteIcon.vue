<template>
  <!-- Note Icon -->
  <div id="note">
    <div class="button-container">
      <span
        id="deleteBtn"
        class="icon icon-delete"
        @click="deleteNote(info.id)"
      ></span>
    </div>
    <!-- Title -->
    <h2 id="title">{{ info.title }}</h2>
    <div>
      <!-- Created -->
      <p id="created">
        <i>Создана</i> {{ info.creationDate.toDate().toLocaleDateString() }}
      </p>
      <!-- Modified -->
      <p id="modified">
        <i>Изменено</i> {{ calcDays(info.lastUpdated.toDate()) }}
      </p>
    </div>
    <button
      id="editBtn"
      @click="$router.push(`/${$route.params.groupID}/notes/${info.id}`)"
    >
      Открыть
    </button>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig';
import { distanceInWordsToNow } from 'date-fns';

export default {
  name: 'NoteIcon',
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  methods: {
    deleteNote(id) {
      db.collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('notes')
        .doc(this.$store.getters.uid)
        .collection('private')
        .doc(id)
        .delete();
    },
    calcDays(date) {
      let ruLocale = require('date-fns/locale/ru');
      let locales = { locale: ruLocale };
      return distanceInWordsToNow(date, locales) + ' спустя';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#note {
  background-color: white;
  height: 288px;
  width: 216px;
  box-shadow: 0 6px 15px rgba(36, 37, 38, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow .3s linear;
  &:hover {
    box-shadow: $shadow-hovered;
  }
}
#title {
  text-align: center;
  font-family: $secondary-font;
  font-weight: 700;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-bottom: 30px;
  max-width: 10em;
  max-height: 5em;
}
#created,
#modified {
  margin: 4px;
  text-align: center;
  color: $secondary;
  font-size: 0.8em;
  font-weight: 500;
}
p > i {
  color: $secondary-light;
  font-style: normal;
  font-weight: 400;
}
#deleteBtn {
  float: right;
  margin: 15px 15px 0 0;
  cursor: pointer;
  background-color: transparent;
  width: 10px;
  color: $secondary-light;
  font-weight: 500;
}
#deleteBtn:hover {
  color: hsl(0, 100%, 55%);
}
#editBtn {
  cursor: pointer;
  background-color: $primary;
  width: 100%;
  color: white;
  font-size: 120%;
  text-align: center;
  padding-top: 5px;
  padding-bottom: 5px;
  font-weight: 400;
  border: none;
  &:hover {
    background-color: lighten($primary, 10);
  }
}
</style>
