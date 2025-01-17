// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';

import { IndexedDBDataKeys } from '../../../../background/IndexedDBDataKeys';
import { IndexedDBAPI } from '../../../../common/indexedDB/indexedDB';
import { Logger } from '../../../../common/logging/logger';
import { ElectronStorageAdapter } from '../../../../electron/adapters/electron-storage-adapter';
import { tick } from '../../tests/electron/common/tick';

describe('ElectronStorageAdapter', () => {
    const expectedData = {
        testKey1: 'test-value-1',
        testKey2: 'test-value-2',
    };
    let electronStorageAdapter: ElectronStorageAdapter;
    let indexedDBInstanceMock: IMock<IndexedDBAPI>;
    let loggerMock: IMock<Logger>;

    beforeEach(() => {
        indexedDBInstanceMock = Mock.ofType<IndexedDBAPI>();
        loggerMock = Mock.ofType<Logger>();
        electronStorageAdapter = new ElectronStorageAdapter(indexedDBInstanceMock.object, loggerMock.object);
    });

    describe('setting user data with electron storage adapter works', () => {
        it('sets user data with input items', async () => {
            indexedDBInstanceMock
                .setup(async indexedDB => await indexedDB.setItem(IndexedDBDataKeys.installation, It.isValue(expectedData)))
                .returns(() => Promise.resolve(true))
                .verifiable(Times.once());

            loggerMock.setup(logger => logger.error(It.isAny())).verifiable(Times.never());

            electronStorageAdapter.setUserData(expectedData);
            await tick();
            indexedDBInstanceMock.verifyAll();
            loggerMock.verifyAll();
        });

        it('sets user data and then fires the callback properly', async () => {
            const mockCallback = jest.fn(() => {
                // do nothing
            });
            indexedDBInstanceMock
                .setup(async indexedDB => await indexedDB.setItem(IndexedDBDataKeys.installation, It.isValue(expectedData)))
                .returns(() => Promise.resolve(true))
                .verifiable(Times.once());

            loggerMock.setup(logger => logger.error(It.isAny())).verifiable(Times.never());

            electronStorageAdapter.setUserData(expectedData, mockCallback);

            await tick();
            expect(mockCallback).toHaveBeenCalled();
            indexedDBInstanceMock.verifyAll();
        });

        it('fails when trying to set user item  and logger is called with error message', async () => {
            indexedDBInstanceMock
                .setup(async indexedDB => await indexedDB.setItem(IndexedDBDataKeys.installation, It.isValue(expectedData)))
                .returns(() => Promise.reject('test-error'))
                .verifiable(Times.once());

            loggerMock
                .setup(logger => logger.error('Error occurred when trying to set user data: ', 'test-error'))
                .verifiable(Times.once());

            electronStorageAdapter.setUserData(expectedData);

            await tick();
            indexedDBInstanceMock.verifyAll();
            loggerMock.verifyAll();
        });
    });

    describe('gets user data works as intented', () => {
        it('gets user data using input keys', () => {
            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.getItem(IndexedDBDataKeys.installation))
                .returns(() => Promise.resolve(expectedData))
                .verifiable(Times.once());

            electronStorageAdapter.getUserData(['testKey1'], async data => {
                await tick();
                expect(data).toEqual({ testKey1: 'test-value-1' });
            });

            indexedDBInstanceMock.verifyAll();
        });

        it('fails when trying to get user data', async () => {
            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.getItem(IndexedDBDataKeys.installation))
                .returns(() => Promise.reject('get-error'))
                .verifiable(Times.once());

            loggerMock.setup(logger => logger.error('Error occurred when trying to get user data: ', 'get-error')).verifiable(Times.once());

            electronStorageAdapter.getUserData(['testKey1'], data => {
                expect(data).toEqual(expectedData);
            });

            await tick();
            indexedDBInstanceMock.verifyAll();
            loggerMock.verifyAll();
        });
    });

    describe('remove user data', () => {
        it('removes user data based on input key', async () => {
            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.getItem(IndexedDBDataKeys.installation))
                .returns(() => Promise.resolve(expectedData))
                .verifiable(Times.once());

            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.setItem(IndexedDBDataKeys.installation, It.isAny()))
                .returns(() => Promise.resolve(true))
                .verifiable(Times.once());

            electronStorageAdapter.removeUserData(IndexedDBDataKeys.installation);

            await tick();
            indexedDBInstanceMock.verifyAll();
        });

        it('fails during getItem when trying to remove data', async () => {
            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.getItem(IndexedDBDataKeys.installation))
                .returns(() => Promise.reject('remove-error'))
                .verifiable(Times.once());

            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.setItem(IndexedDBDataKeys.installation, It.isAny()))
                .returns(() => Promise.resolve(true))
                .verifiable(Times.never());

            loggerMock
                .setup(logger => logger.error('Error occurred when trying to remove user data: ', 'remove-error'))
                .verifiable(Times.once());

            electronStorageAdapter.removeUserData(IndexedDBDataKeys.installation);

            await tick();
            indexedDBInstanceMock.verifyAll();
            loggerMock.verifyAll();
        });

        it('fails during setItem when trying to remove data', async () => {
            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.getItem(IndexedDBDataKeys.installation))
                .returns(() => Promise.resolve({}))
                .verifiable(Times.once());

            indexedDBInstanceMock
                .setup(indexedDB => indexedDB.setItem(IndexedDBDataKeys.installation, It.isAny()))
                .returns(() => Promise.reject('fail-set-item'))
                .verifiable(Times.once());

            loggerMock.setup(logger => logger.error('fail-set-item')).verifiable(Times.once());

            electronStorageAdapter.removeUserData(IndexedDBDataKeys.installation);

            await tick();
            indexedDBInstanceMock.verifyAll();
            loggerMock.verifyAll();
        });
    });
});
