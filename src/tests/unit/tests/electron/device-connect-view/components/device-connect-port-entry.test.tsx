// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DeviceConnectState, UpdateStateCallback } from 'electron/device-connect-view/components/device-connect-body';
import { DeviceConnectPortEntry, DeviceConnectPortEntryProps } from 'electron/device-connect-view/components/device-connect-port-entry';
import { DeviceConnectActionCreator } from 'electron/flux/action-creator/device-connect-action-creator';
import { FetchScanResultsType } from 'electron/platform/android/fetch-scan-results';
import { ScanResults } from 'electron/platform/android/scan-results';
import { shallow } from 'enzyme';
import { Button } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { EventStubFactory } from 'tests/unit/common/event-stub-factory';
import { IMock, Mock, MockBehavior, Times } from 'typemoq';
import { tick } from '../../common/tick';

describe('DeviceConnectPortEntryTest', () => {
    const testPortNumber = 111;
    const eventStub = new EventStubFactory().createMouseClickEvent() as React.MouseEvent<Button>;

    let fetchScanResultsMock: IMock<FetchScanResultsType>;
    let updateStateCallbackMock: IMock<UpdateStateCallback>;
    let deviceConnectActionCreatorMock: IMock<DeviceConnectActionCreator>;

    beforeEach(() => {
        fetchScanResultsMock = Mock.ofType<FetchScanResultsType>(undefined, MockBehavior.Strict);
        updateStateCallbackMock = Mock.ofType<UpdateStateCallback>(undefined, MockBehavior.Strict);
        deviceConnectActionCreatorMock = Mock.ofType<DeviceConnectActionCreator>(undefined, MockBehavior.Strict);
    });

    describe('renders', () => {
        const needsValidationCases = [true, false];

        it.each(needsValidationCases)('with needsValidation = %s', needsValidation => {
            const props = {
                needsValidation,
            } as DeviceConnectPortEntryProps;

            const rendered = shallow(<DeviceConnectPortEntry {...props} />);

            expect(rendered.getElement()).toMatchSnapshot();
        });
    });

    describe('user interaction', () => {
        describe('change port number', () => {
            const portNumberCases = [testPortNumber.toString(), '', null];

            it.each(portNumberCases)('handles port text = "%s"', portNumberText => {
                updateStateCallbackMock.setup(callback => callback(DeviceConnectState.Default, undefined));

                const props = {
                    updateStateCallback: updateStateCallbackMock.object,
                } as DeviceConnectPortEntryProps;

                const rendered = shallow(<DeviceConnectPortEntry {...props} />);

                expect(rendered.state()).toMatchSnapshot();

                rendered.find('.port-number-field').simulate('change', null, portNumberText);

                updateStateCallbackMock.verifyAll();

                expect(rendered.state()).toMatchSnapshot();
            });
        });

        describe('validate port number', () => {
            let props: DeviceConnectPortEntryProps;

            const fetchResultResolved = () => Promise.resolve({ deviceName: 'dev', appIdentifier: 'app' } as ScanResults);
            const fetchResultRejected = () => Promise.reject({} as ScanResults);

            beforeEach(() => {
                updateStateCallbackMock.setup(r => r(DeviceConnectState.Connecting)).verifiable(Times.once());
                deviceConnectActionCreatorMock.setup(creator => creator.validatePort(testPortNumber)).verifiable(Times.once());

                props = {
                    deps: {
                        fetchScanResults: fetchScanResultsMock.object,
                        deviceConnectActionCreator: deviceConnectActionCreatorMock.object,
                    },
                    updateStateCallback: updateStateCallbackMock.object,
                } as DeviceConnectPortEntryProps;
            });

            test.each`
                description        | fetch                  | connectState                    | deviceName
                ${'fetch success'} | ${fetchResultResolved} | ${DeviceConnectState.Connected} | ${'dev - app'}
                ${'fetch fail'}    | ${fetchResultRejected} | ${DeviceConnectState.Error}     | ${undefined}
            `('$description', async ({ fetch, connectState, deviceName }) => {
                setupFetchScanResultsMock(fetch);
                setupUpdateStateCallbackMock(connectState, deviceName);

                const rendered = shallow(<DeviceConnectPortEntry {...props} />);
                rendered.setState({ isValidateButtonDisabled: false, port: testPortNumber });
                const button = rendered.find('.button-validate-port');

                button.simulate('click', eventStub);

                fetchScanResultsMock.verifyAll();

                await tick();

                expect(rendered.state()).toEqual({ isValidateButtonDisabled: false, port: testPortNumber });

                updateStateCallbackMock.verifyAll();
                deviceConnectActionCreatorMock.verifyAll();
            });

            const setupFetchScanResultsMock = (fetch: FetchScanResultsType) => {
                fetchScanResultsMock
                    .setup(r => r(testPortNumber))
                    .returns(fetch)
                    .verifiable();
            };

            const setupUpdateStateCallbackMock = (connectState: DeviceConnectState, deviceName: string) => {
                updateStateCallbackMock.setup(callback => callback(connectState, deviceName)).verifiable();
            };
        });
    });
});
