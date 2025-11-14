import { App } from './app';

describe('App', () => {
  it('should create an instance', () => {
    const app = new App();
    expect(app).toBeTruthy();
  });

  it('should have a title signal', () => {
    const app = new App();
    expect(app['title']()).toBe('loop-eat');
  });

  it('should add two numbers correctly', () => {
    const app = new App();
    expect(app.sum(1, 4)).toBe(5);
  });
});