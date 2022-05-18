const faker = require('faker');

faker.locale = 'es'; //Para que todo lo generado sea en lenguaje Español

const {commerce, image} = faker;

const generateRandomArrayProducts = (num) => {
    const array = [];
    for (let i = 0; i < num; i++) {
        array.push({
            id: i+1,
            title: commerce.product(),
            price: commerce.price(),
            thumbnail: image.image(640, 480, true)
        });
    }

    return array;
};

module.exports = {
    generateRandomArrayProducts
}