import {
  emptyRvsInputs,
  isRvsInputs,
  scoringOptions,
  hazardFields,
} from './rvs.ts';
import type { RvsInputs } from './rvs';
// Only categorical inputs and story count travel in the fragment. Never include
// report IDs, owners, addresses, coordinates, observations, photos, or credentials.
export function rvsDemoPath(inputs?: RvsInputs): string {
  if (!inputs) return '#/rvs-demo';
  if (!isRvsInputs(inputs)) throw new Error('Invalid simulation inputs');
  const values = [
    1,
    ...Object.entries(scoringOptions).map(([key, options]) =>
      (options as readonly string[]).indexOf(
        inputs[key as keyof typeof scoringOptions],
      ),
    ),
    inputs.stories || '-',
    ...hazardFields.map(([key]) => ['DNK', 'yes', 'no'].indexOf(inputs[key])),
  ];
  return `#/rvs-demo?data=${values.join('.')}`;
}
export function parseRvsDemoPath(
  path: string,
):
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'inputs'; inputs: RvsInputs } {
  if (path === 'rvs-demo') return { kind: 'empty' };
  if (!/^rvs-demo\?data=[\d.-]{1,100}$/.test(path)) return { kind: 'invalid' };
  const values = path.slice('rvs-demo?data='.length).split('.');
  if (values.length !== 17 || values[0] !== '1') return { kind: 'invalid' };
  if (!values.slice(7).every((value) => /^[012]$/.test(value)))
    return { kind: 'invalid' };
  const inputs = emptyRvsInputs(values[6] === '-' ? '' : values[6]);
  let index = 1;
  for (const [key, options] of Object.entries(scoringOptions)) {
    const value = values[index++];
    if (!/^\d{1,2}$/.test(value)) return { kind: 'invalid' };
    Object.assign(inputs, { [key]: options[Number(value)] });
  }
  hazardFields.forEach(([key], i) => {
    inputs[key] = (['DNK', 'yes', 'no'] as const)[Number(values[i + 7])];
  });
  return isRvsInputs(inputs) ? { kind: 'inputs', inputs } : { kind: 'invalid' };
}
