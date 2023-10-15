const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const puppeteer = require('puppeteer');
const fs = require('fs');
const pdf = require('pdfkit');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    server.route({
        method: 'POST',
        path: '/',
        handler: async (request, h) => {
            const { urls } = request.payload;
            const pdfBuffer = await createPDF(urls);
            return h.response(pdfBuffer)
                .header('Content-Type', 'application/pdf');
        },
        options: {
            validate: {
                payload: Joi.object({
                    urls: Joi.array().items(Joi.string().uri()).required().min(1)
                })
            }
        }
    });

    async function createPDF(urls) {
        const browser = await puppeteer.launch({ headless: "new" });
        const doc = new pdf();
        doc.font('./inter.ttf').fontSize(14);
        doc.pipe(fs.createWriteStream('words.pdf'));

        for (const url of urls) {
            const page = await browser.newPage();
            await page.goto(url);

            const text = await page.evaluate(() => {
                return document.body.innerText;
            });

            const words = text.split(/\s+/).filter(word => (word.length > 4) && word.match(/^[a-zA-Zа-яА-Я]+$/));

            if (words) {
                doc.text(url, { link: url });
                const topWords = findMostFrequentWords(words);
                if (topWords.length)
                    doc.text(topWords.join(' | '));
                else
                    doc.text('На странице не найдено требуемых слов')
                doc.text('\n');
            }
            await page.close();
        }
        doc.end();
        await browser.close();
    }

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

function findMostFrequentWords(words) {
    const wordCount = {};

    words.forEach(word => {
        if (wordCount[word]) wordCount[word]++;
        else wordCount[word] = 1;
    });

    const wordCountArr = Object.keys(wordCount).map(word => ({
        word: word,
        count: wordCount[word],
    }));
    wordCountArr.sort((a, b) => b.count - a.count);
    const mfWords = wordCountArr.slice(0, 3).map(item => item.word);
    return mfWords;
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();