import { consola } from 'consola';

const logger = consola.create({
  level: process.env.NODE_ENV === 'production' ? 3 : 4,
  formatOptions: {
    colors: process.env.NODE_ENV !== 'production',
    compact: process.env.NODE_ENV === 'production',
    date: true,
  },
});

export default logger;
