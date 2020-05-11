<template>
  <div class="date-header">
    {{ dateHeader(date) }}
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'AgendaItemDateHeader',
  props: {
    date: {
      type: Date,
      required: true,
    },
  },
  methods: {
    dateHeader(date) {
      const ruLocale = require('date-fns/locale/ru');
      let locales = { locale: ruLocale };
      return format(date, 'dddd, MMMM Do', locales).toLowerCase();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.date-header {
  color: $dark;
  font-size: 1em;
  text-align: left;
  width: 200px;
  margin: 0 0 10px 0;
}
</style>
