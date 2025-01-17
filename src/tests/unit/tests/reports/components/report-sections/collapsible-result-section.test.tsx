// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import {
    CollapsibleResultSection,
    CollapsibleResultSectionDeps,
    CollapsibleResultSectionProps,
} from 'reports/components/report-sections/collapsible-result-section';
import { Mock } from 'typemoq';

import { CollapsibleComponentCardsProps } from '../../../../../../DetailsView/components/cards/collapsible-component-cards';

describe('CollapsibleResultSection', () => {
    it('renders', () => {
        const collapsibleControlMock = Mock.ofType<(props: CollapsibleComponentCardsProps) => JSX.Element>();
        const props: CollapsibleResultSectionProps = {
            deps: {
                collapsibleControl: collapsibleControlMock.object,
            } as CollapsibleResultSectionDeps,
            containerClassName: 'result-section-class-name',
            containerId: 'container-id',
        } as CollapsibleResultSectionProps;

        const wrapper = shallow(<CollapsibleResultSection {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
