import { chromium } from "playwright";

(async () => {
    const browser = await chromium.launch({ devtools: true });
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto("https://local.faustt.dev:3000/");

    const todos = ["A", "B", "C", "D", "E"];

    for (const todo of todos) {
        await page.waitForSelector("[data-test=todo-title]:not(:disabled)");
        await page.waitForSelector("[data-test=todo-submit]:not(:disabled)");
        await page.waitForTimeout(500);
        await page.type("[data-test=todo-title]", todo);
        await page.click("[data-test=todo-submit]");
    }

    const swap = async (titleA: string, titleB: string) => {
        await page.waitForSelector("[data-test=todo-title]:not(:disabled)");
        await page.waitForSelector("[data-test=todo-submit]:not(:disabled)");
        await page.waitForTimeout(500);

        const b = (await page.$(`[data-test-title=${titleA}]`))!;
        const d = (await page.$(`[data-test-title=${titleB}]`))!;

        const bbb = (await b.boundingBox())!;
        const dbb = (await d.boundingBox())!;

        await page.mouse.move(bbb.x + bbb.width / 2, bbb.y + bbb.height / 2, { steps: 150 });
        await page.waitForTimeout(500);
        await page.mouse.down({ button: "left" });
        await page.waitForTimeout(500);
        await page.mouse.move(dbb.x + dbb.width / 2, dbb.y + dbb.height / 2, { steps: 150 });
        await page.waitForTimeout(500);
        await page.mouse.up({ button: "left" });
    };

    await swap("B", "D");
    await swap("B", "C");
    await swap("A", "E");
    await swap("A", "B");

    await new Promise((resolve) => {
        setTimeout(resolve, 120000);
    });

    await browser.close();
})();
