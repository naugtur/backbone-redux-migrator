import {CHOICE_ACTION} from '../'
import {Chooser, Choice} from '../Chooser.jsx'
import { mount, shallow } from 'enzyme';
import React from 'react';

describe('Chooser component', () => {
  it('should render', () => {
    shallow(<Chooser/>)
  })

})
