import suite from './suite';
import {init} from '../src/index';

jasmine.getEnv().addReporter(init());
suite();
