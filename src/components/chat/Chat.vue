<template>
  <div>
    <div class="sidebar" :class="show ? 'active' : 'collapsed'">
      <div class="content">
        <h3 id="header">Чат</h3>
        <div ref="messages" class="messages">
          <transition-group
            name="chatTransition"
            enter-active-class="animated fadeInDown"
          >
            <message
              v-for="(message, index) in groupMessages"
              :key="message.date.toString()"
              :show-name="showSender(index)"
              :sender="message.sender === $store.getters.uid ? true : false"
              :details="message"
            ></message>
          </transition-group>
        </div>
        <input
          v-model="userMessage"
          type="text"
          class="form-input message-input"
          placeholder="Введіть посилання"
          @keydown.enter="sendMessage"
        />
        <button
          class="btn btn-success text-light c-hand"
          :class="userMessage === '' ? 'disabled' : ''"
          @click="sendMessage"
        >
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Message from '@/components/chat/Message';
import { db } from '@/firebaseConfig';

let notification = new Audio(
  'https://notificationsounds.com/soundfiles/4e4b5fbbbb602b6d35bea8460aa8f8e5/file-sounds-1096-light.mp3'
);

export default {
  name: 'Chat',
  components: {
    Message,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userMessage: '',
      groupMessages: [],
    };
  },
  computed: {
    messageLength() {
      return this.groupMessages.length;
    },
  },
  watch: {
    // Reload the group's messages when the user switches groups
    '$route.params.groupID'() {
      this.loadGroupMessages();
    },
    messageLength(newVal, oldVal) {
      if (
        oldVal !== 0 &&
        newVal !== 0 &&
        this.groupMessages[this.groupMessages.length - 1].sender !==
          this.$store.getters.uid
      ) {
        if (!this.$store.getters.chatActive) {
          notification.play();
        } else {
          // Have to adjust the time depending on the speed of message animation
          setTimeout(() => {
            this.scrollToBottom();
          }, 500);
        }
      }
    },
  },
  created() {
    this.loadGroupMessages();
  },
  methods: {
    showSender(index) {
      if (index !== 0) {
        return (
          this.groupMessages[index].sender !=
          this.groupMessages[index - 1].sender
        );
      } else {
        // The first item will always show the header.
        return true;
      }
    },
    scrollToBottom() {
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
    },
    sendMessage() {
      if (this.userMessage !== '') {
        db.collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('messages')
          .add({
            date: new Date(),
            displayName: this.user.displayName,
            message: this.userMessage,
            photoURL: this.user.photoURL,
            sender: this.$store.getters.uid,
          })
          .then(() => {
            this.scrollToBottom();
          });
        this.userMessage = '';
      }
    },
    loadGroupMessages() {
      this.$bind(
        'groupMessages',
        db
          .collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('messages')
          .orderBy('date', 'asc')
      ).then((groupMessages) => {
        this.groupMessages === groupMessages;
        this.scrollToBottom();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#header {
  display: block;
  transition: 0.25s;
  padding: 4px 0;
  font-family: $secondary-font;
  user-select: none;
  font-size: 18px;
  font-weight: 700;
  color: $primary;
}
.sidebar {
  color: white;
  height: calc(100% - 60px);
  width: 0;
  position: absolute;
  z-index: 2;
  top: 60px;
  right: 0;
  background-color: #fff;
  overflow-x: hidden;
  transition: 0.25s;
  padding-top: 10px;
  box-shadow: $shadow;
  .content {
    height: 100%;
    min-width: 300px;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
  }
}
.messages {
  flex: 5;
  overflow-y: auto;
  padding: 20px 0;
}
.message-input {
  resize: none;
  width: 95%;
  margin: 10px auto;
  border-radius: 10px;
}
.collapsed {
  width: 0;
  transition: 0.25s;
}
.text {
  display: block;
  transition: 0.25s;
}
.active {
  width: 300px;
}
</style>
