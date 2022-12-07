import puppeteer, {Device} from "puppeteer";
import {createCanvas, loadImage} from "canvas";
import * as fs from "fs";

const iPhone: Device = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    viewport: {
        width: 375,
        height: 667,
        isMobile: true,
        deviceScaleFactor: 2,
    }
}
const WATERMARK = __dirname + "/../logo.svg";
const WATERMARK_SPACING = 50;

async function takeScreenshot(url: string, selector: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.emulate(iPhone)
    await page.goto(url);
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    await page.evaluate((element) => element?.scrollIntoView(), element);
    const screenshot = await element!.screenshot();
    await browser.close();
    return screenshot;
}

async function addWaterMark(imageSource: string | Buffer, watermarkSource: string | Buffer) {
    const [image, watermark] = await Promise.all([loadImage(imageSource), loadImage(watermarkSource)])
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    ctx.globalAlpha = 0.2;
    for (let i = 5; i < image.width; i += watermark.width + WATERMARK_SPACING) {
        for (let j = 5; j < image.height; j += watermark.height + WATERMARK_SPACING) {
            ctx.drawImage(watermark, i, j);
        }
    }
    return canvas.toBuffer();
}

function storeImage(image: Buffer) {
    fs.writeFileSync(__dirname + "/../screenshot.png", image);
}

async function main() {
    takeScreenshot("https://evcrp.com", "#company2").then((image) => addWaterMark(image, WATERMARK)).then(storeImage);
}

main()

