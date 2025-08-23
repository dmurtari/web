import { consola } from 'consola';

const logger = consola.create({
  level: import.meta.dev ? 4 : 2,
  formatOptions: {
    colors: true,
    compact: false,
    date: true,
  },
});

export default logger;
