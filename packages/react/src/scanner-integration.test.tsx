import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { PageAIProvider, usePageAI } from './index'; // Assuming index exports these

// A simple component that uses the usePageAI hook
const TestScannerComponent: React.FC = () => {
  const { interactiveElements } = usePageAI();

  useEffect(() => {
    // This effect is just for potential debugging during test development
    // console.log('Interactive elements:', interactiveElements);
  }, [interactiveElements]);

  return (
    <div>
      <h1>Test Page for Scanner Integration</h1>
      <button id="btn1">Button 1</button>
      <input type="text" id="input1" aria-label="Input 1" />
      <a href="#" id="link1">Link 1</a>
      <div data-ai-hide>
        <button id="hiddenBtn">Hidden Button by Attr</button>
      </div>
    </div>
  );
};

describe('@page-ai/react scanner integration', () => {
  it('should populate interactiveElements via usePageAI when wrapped in PageAIProvider', async () => {

    let foundElements: any[] | null = null;
    const TestScannerComponentWithExpose: React.FC = () => {
      const hookValues = usePageAI();
      useEffect(() => {
        foundElements = hookValues.interactiveElements;
      }, [hookValues.interactiveElements]);
      return <TestScannerComponent />; // Render the original structure
    };

    render(
      <PageAIProvider>
        <TestScannerComponentWithExpose />
      </PageAIProvider>
    );

    await waitFor(() => {
      expect(foundElements).not.toBeNull();
      expect(foundElements!.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // Verify some expected elements
    // Expected: button, input, link (3 elements)
    // The hiddenBtn should be excluded.
    expect(foundElements).toHaveLength(3);

    const buttonElement = foundElements!.find(el => el.elementId === 'btn1');
    expect(buttonElement).toBeDefined();
    expect(buttonElement.elementType).toBe('button');
    expect(buttonElement.accessibleName).toBe('Button 1');

    const inputElement = foundElements!.find(el => el.elementId === 'input1');
    expect(inputElement).toBeDefined();
    expect(inputElement.elementType).toBe('input');
    expect(inputElement.accessibleName).toBe('Input 1');
    
    const linkElement = foundElements!.find(el => el.elementId === 'link1');
    expect(linkElement).toBeDefined();
    expect(linkElement.elementType).toBe('a');
    expect(linkElement.accessibleName).toBe('Link 1');

    const hiddenElement = foundElements!.find(el => el.elementId === 'hiddenBtn');
    expect(hiddenElement).toBeUndefined();
  });
});