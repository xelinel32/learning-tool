<template>
  <div v-if="!isLoading && !isError">
    <notifications group="notes" class="m-2" position="right bottom" />

    <!-- New Header Component -->
    <page-title>
      <template slot="left">
        <input
          v-model="noteTitle"
          class="name-input"
          type="text"
          maxlength="40"
          @input="isSaved = false"
        />
      </template>
      <template slot="right">
        <confirm-button class="split" @buttonClicked="deleteNote">
          <template v-slot:title>
            Удалить заметку?
          </template>
          <template v-slot:body>
            Эта задача будет немедленно удалена.
          </template>
          <template v-slot:button-text>
            Удалить
          </template>
        </confirm-button>

        <button
          class="btn btn-action split"
          :class="pdfIsLoading ? 'loading' : ''"
          @click="exportNote"
        >
          <i class="fas fa-file-download"></i>
        </button>

        <!-- Save the markdown to database -->
        <button
          class="btn btn-success btn-action split"
          :class="isSaved ? 'disabled' : ''"
          @click="saveNote"
        >
          <i class="fas fa-save"></i>
        </button>
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          class="btn btn-primary btn-action split"
        >
          <i class="fas fa-link"></i>
        </a>
      </template>
    </page-title>

    <div class="content-container">
      <a id="hiddenLink" style="display: hidden"></a>
      <textarea
        v-model="userText"
        class="page-edit"
        @input="isSaved = false"
        @keydown.ctrl.83.prevent="saveNote"
      >
      </textarea>
      <div class="page-view" v-html="render"></div>
    </div>
  </div>
  <div v-else-if="!isLoading && isError" id="error-container">
    <img
      style="width: 10em;"
      class="undraw-svg"
      src="@/assets/undraw_warning.svg"
      alt="Error Loading Group"
    />
    <h1>Ошибка при загрузке заметок...</h1>
  </div>
  <div v-else class="loading loading-lg"></div>
</template>

<script>
import PageTitle from '@/components/navigation/PageTitle';
import ConfirmButton from '@/components/ConfirmButton';
import { db } from '@/firebaseConfig';

let marked = require('marked');

export default {
  name: 'NotePage',
  components: {
    ConfirmButton,
    PageTitle,
  },
  beforeRouteLeave(to, from, next) {
    if (!this.isSaved) {
      if (confirm('Задача не сохранена. Вы действитель хотите уйти?')) {
        next();
      }
    } else {
      next();
    }
  },
  data() {
    return {
      // Set to false when firebase query returns
      isLoading: true,
      // If firebase returns with error, set to true
      isError: false,
      isSaved: true,
      noteTitle: '',
      userText: '',
      pdfIsLoading: false,
    };
  },
  computed: {
    render() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
      });
      return marked(this.userText);
    },
  },
  created() {
    db.collection('study-groups')
      .doc(this.$route.params.groupID)
      .collection('notes')
      .doc(this.$store.getters.uid)
      .collection('private')
      .doc(this.$route.params.noteID)
      .get()
      .then((doc) => {
        this.noteTitle = doc.data().title;
        this.userText = doc.data().content;
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
        this.isError = true;
      });
  },
  methods: {
    exportNote() {
      this.pdfIsLoading = true;

      fetch('https://ancient-dusk-74849.herokuapp.com/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: this.noteTitle, content: this.userText }),
      })
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          const href = window.URL.createObjectURL(blob);
          const a = document.getElementById('hiddenLink');
          a.download = this.noteTitle + '.pdf';
          a.href = href;
          a.click();
          a.href = '';
          this.pdfIsLoading = false;
        });
    },
    deleteNote() {
      db.collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('notes')
        .doc(this.$store.getters.uid)
        .collection('private')
        .doc(this.$route.params.noteID)
        .delete();

      this.$router.go(-1);
    },
    saveNote() {
      db.collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('notes')
        .doc(this.$store.getters.uid)
        .collection('private')
        .doc(this.$route.params.noteID)
        .update({
          title: this.noteTitle,
          lastUpdated: new Date(),
          content: this.userText,
        })
        .then(() => {
          this.isSaved = true;
          this.$notify({
            group: 'notes',
            type: 'success',
            title: 'Задача сохранена!',
            text: 'Эта задача была сохранена.',
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';
@import '../../assets/github.css';

#error-container {
  max-height: 75%;
  margin-top: 200px;
}
.content-container {
  display: inline-block;
  padding: 30px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: flex-start;
  height: $page-with-header-height;
}
.page-edit {
  padding: 10px;
  box-shadow: $shadow-hovered;
  border: none;
  display: inline-block;
  height: 100%;
  width: 50%;
  margin-right: 40px;
  background-color: white;
  color: black;
  text-align: left;
  resize: none;
}
.page-view {
  padding: 20px !important;
  box-shadow: $shadow-hovered;
  font-family: $primary-font;
  background-color: white;
  padding: 0;
  overflow-y: auto;
  text-align: left;
  height: 100%;
  width: 50%;
}
</style>
