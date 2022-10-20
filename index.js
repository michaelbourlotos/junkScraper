const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const fsSync = require('fs');

// enter make and model to check for -- expand later for multiple make/models
const make = "HONDA";
const model = "ELEMENT";

(async function scrape() {
    const browser = await puppeteer.launch({ headless: true});

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');

    await page.goto('https://chesterfieldauto.com/search-our-inventory-by-location/');
    
    await page.waitForSelector('#cap-search-make');
    // list of all make options
    const makes = await page.$$eval("#cap-search-make option", (opts)=>{
        return opts.map(x => x.textContent);
    })
    // search make options list for selected make, if exists set make to selection else close
    if (makes.includes(make)){
        console.log("selected make found");
        await page.select('#cap-search-make', make);
    } else {
        console.log("make not found");
        await browser.close();
    }
    // wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));
    // form doesnt realiably auto submit for some reason - manually submit form after make is selected
    await page.$eval('#search_form', form => form.submit());

    await page.waitForSelector("#cap-search-model option");
    // list of all model options
    const models = await page.$$eval("#cap-search-model option", (opts)=>{
        return opts.map(x => x.textContent);
    })
    // search model options list for selected model, if exists set model to selection else close
    if (models.includes(model)){
        console.log("selected model found");
        await page.select('#cap-search-model', model);
    } else {
        console.log("model not found");
        await browser.close();
    }
    // wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));
    // form doesnt realiably auto submit for some reason - manually submit form after make is selected
    await page.$eval('#search_form', form => form.submit());
    //wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));
    // array from text content of all returned results
    const results = await page.evaluate(() =>{
        return Array.from(document.querySelectorAll(".cap-search-results-cell-text")).map(x => x.textContent);
    });
    //writes results array to results.txt
    if (fsSync.existsSync("./results.txt")){
        await fs.writeFile("new-results.txt", results.join("\r\n"));
        console.log("new results");
    } else {
        await fs.writeFile("results.txt", results.join("\r\n"));
    }
    

    console.log('sup');
    await browser.close();


})();