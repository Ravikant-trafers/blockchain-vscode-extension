/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import { FabricEnvironmentRegistry } from '../../src/registries/FabricEnvironmentRegistry';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import { FabricEnvironmentRegistryEntry, EnvironmentType, EnvironmentFlags } from '../../src/registries/FabricEnvironmentRegistryEntry';
import { FabricRuntimeUtil } from '../../src/util/FabricRuntimeUtil';

chai.should();
chai.use(chaiAsPromised);

describe('FabricEnvironmentRegistry', () => {

    const registry: FabricEnvironmentRegistry = FabricEnvironmentRegistry.instance();

    before(async () => {
        const registryPath: string = path.join(__dirname, 'tmp', 'registries');
        registry.setRegistryPath(registryPath);
    });

    beforeEach(async () => {
        await registry.clear();
    });

    afterEach(async () => {
        await registry.clear();
    });

    it('should get all the environments and put local fabric first', async () => {
        const environmentOne: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentOne',
            environmentType: EnvironmentType.ENVIRONMENT
        });

        await registry.getAll().should.eventually.deep.equal([]);

        await FabricEnvironmentRegistry.instance().add(new FabricEnvironmentRegistryEntry({
            name: FabricRuntimeUtil.LOCAL_FABRIC,
            environmentType: EnvironmentType.LOCAL_ENVIRONMENT
        }));

        const localFabricEntry: FabricEnvironmentRegistryEntry = await FabricEnvironmentRegistry.instance().get(FabricRuntimeUtil.LOCAL_FABRIC);

        await registry.add(environmentOne);
        await registry.getAll().should.eventually.deep.equal([localFabricEntry, environmentOne]);
    });

    it('should get all environments but not show local fabric', async () => {
        const environmentOne: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentOne',
            environmentType: EnvironmentType.ENVIRONMENT
        });

        await registry.getAll().should.eventually.deep.equal([]);

        await FabricEnvironmentRegistry.instance().add(new FabricEnvironmentRegistryEntry({
            name: FabricRuntimeUtil.LOCAL_FABRIC,
            environmentType: EnvironmentType.LOCAL_ENVIRONMENT
        }));
        await registry.add(environmentOne);
        await registry.getAll([], [EnvironmentFlags.LOCAL]).should.eventually.deep.equal([environmentOne]);
    });

    it(`should get all managed environments including the ${FabricRuntimeUtil.LOCAL_FABRIC}`, async () => {

        const environmentOne: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentOne',
            environmentType: EnvironmentType.ANSIBLE_ENVIRONMENT
        });

        const environmentTwo: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentTwo',
            environmentType: EnvironmentType.MANAGED_ANSIBLE_ENVIRONMENT
        });

        await registry.getAll().should.eventually.deep.equal([]);

        await FabricEnvironmentRegistry.instance().add(new FabricEnvironmentRegistryEntry({
            name: FabricRuntimeUtil.LOCAL_FABRIC,
            environmentType: EnvironmentType.LOCAL_ENVIRONMENT
        }));

        const localFabricEntry: FabricEnvironmentRegistryEntry = await FabricEnvironmentRegistry.instance().get(FabricRuntimeUtil.LOCAL_FABRIC);

        await registry.add(environmentOne);
        await registry.add(environmentTwo);

        await registry.getAll([EnvironmentFlags.MANAGED]).should.eventually.deep.equal([localFabricEntry, environmentTwo]);
    });

    it(`should get all managed environments excluding the ${FabricRuntimeUtil.LOCAL_FABRIC}`, async () => {

        const environmentOne: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentOne',
            environmentType: EnvironmentType.ANSIBLE_ENVIRONMENT
        });

        const environmentTwo: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentTwo',
            environmentType: EnvironmentType.MANAGED_ANSIBLE_ENVIRONMENT
        });
        await registry.getAll().should.eventually.deep.equal([]);

        await FabricEnvironmentRegistry.instance().add(new FabricEnvironmentRegistryEntry({
            name: FabricRuntimeUtil.LOCAL_FABRIC,
            environmentType: EnvironmentType.LOCAL_ENVIRONMENT
        }));

        await registry.add(environmentOne);
        await registry.add(environmentTwo);

        await registry.getAll([EnvironmentFlags.MANAGED], [EnvironmentFlags.LOCAL]).should.eventually.deep.equal([environmentTwo]);
    });

    it('should only get non ansible environments', async () => {
        const environmentOne: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentOne',
            environmentType: EnvironmentType.ENVIRONMENT
        });

        const environmentTwo: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'environmentTwo',
            managedRuntime: true,
            environmentType: EnvironmentType.ANSIBLE_ENVIRONMENT
        });
        await registry.getAll().should.eventually.deep.equal([]);

        await FabricEnvironmentRegistry.instance().add(new FabricEnvironmentRegistryEntry({
            name: FabricRuntimeUtil.LOCAL_FABRIC,
            environmentType: EnvironmentType.LOCAL_ENVIRONMENT
        }));

        await registry.add(environmentOne);
        await registry.add(environmentTwo);

        await registry.getAll([], [EnvironmentFlags.ANSIBLE]).should.eventually.deep.equal([environmentOne]);
    });
});
