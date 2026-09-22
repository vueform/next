import inputText from './input-text'
import inputTextVmodel from './input-text-vmodel'
import renderSteps from './render-steps'
import renderText from './render-text'
import updateAll from './update-all'
import type { BenchCase } from '../case'

/**
 * All registered benchmark cases in execution order.
 */
const cases: BenchCase[] = [
  renderText,
  renderSteps,
  inputText,
  inputTextVmodel,
  updateAll,
]

export default cases
