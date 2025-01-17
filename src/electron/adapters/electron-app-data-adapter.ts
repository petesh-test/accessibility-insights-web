// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { remote } from 'electron';
import { AppDataAdapter } from '../../common/browser-adapters/app-data-adapter';

export class ElectronAppDataAdapter implements AppDataAdapter {
    public getVersion(): string {
        return remote.app.getVersion();
    }
}
