import * as input from '../_input'
import { View } from './components/view'
import { TimelineSettings } from '../../utils/options'


const view = new View(
    input.rootNode, input.pages, new TimelineSettings()
)

input.rootNode.appendChild(view.render())