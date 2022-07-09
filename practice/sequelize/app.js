const { sequelize } = require('./models/index');

const driver = () => {
    sequelize.sync().then(() => {
        console.log('초기화 완료');
    }).catch((err) => {
        console.error(err);
    });
};
driver();