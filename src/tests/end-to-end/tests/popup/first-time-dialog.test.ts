// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Browser } from '../../common/browser';
import { launchBrowser } from '../../common/browser-factory';
import { Page } from '../../common/page';
import { popupPageSelectors } from '../../common/selectors/popup-page-selectors';

describe('First time Dialog Tests', () => {
    let browser: Browser;
    let targetPage: Page;
    let targetPageTabId: number;

    beforeEach(async () => {
        browser = await launchBrowser({ dismissFirstTimeDialog: false });
        await setupTargetPage();
    });

    afterEach(async () => {
        await browser.close();
    });

    async function setupTargetPage(): Promise<void> {
        targetPage = await browser.newTestResourcePage('all.html');
        await targetPage.bringToFront();
        targetPageTabId = await browser.getActivePageTabId();
    }

    async function newPopupPage(): Promise<Page> {
        return await browser.newExtensionPopupPage(targetPageTabId);
    }

    it('should be dismissed by clicking the OK button', async () => {
        const firstPopupPage = await newPopupPage();
        await firstPopupPage.bringToFront();

        await firstPopupPage.clickSelector(popupPageSelectors.startUsingProductButton);
        await firstPopupPage.waitForSelectorToDisappear(popupPageSelectors.telemetryDialog);
        await firstPopupPage.close();

        const secondPopupPage = await newPopupPage();
        await secondPopupPage.waitForSelector(popupPageSelectors.launchPad);
        await secondPopupPage.waitForSelectorToDisappear(popupPageSelectors.telemetryDialog);
    },
    );

    it('should have HTML content that matches the snapshot', async () => {
        const popupPage = await newPopupPage();
        await popupPage.waitForSelector(popupPageSelectors.telemetryDialog);

        const element = await popupPage.getPrintableHtmlElement(popupPageSelectors.telemetryDialog);
        expect(element).toMatchSnapshot();
    },
    );
});