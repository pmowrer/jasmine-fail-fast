import suite from './suite';
import failFast from '../src/index';

jasmine.getEnv().addReporter(failFast());
suite();
