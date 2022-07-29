import { ScenarioHostApp } from '@axinom/mosaic-fe-samples-host';
import { render, screen } from '@testing-library/react';

describe('scenario host', () => {
  test('renders scenario host and the scenarios link at the top is visible', () => {
    render(<ScenarioHostApp scenarios={[]} />);

    const rootScenariosLink = screen.getByText('Scenarios', { selector: 'a' });
    expect(rootScenariosLink).toBeInTheDocument();
  });
});
