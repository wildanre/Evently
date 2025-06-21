/**
 * @jest-environment jsdom
 */

import { LINKS } from '../src/lib/data';

describe('Data Constants', () => {
  describe('LINKS', () => {
    it('should contain all required navigation links', () => {
      expect(LINKS).toBeDefined();
      expect(Array.isArray(LINKS)).toBe(true);
      expect(LINKS.length).toBe(5);
    });

    it('should have correct structure for each link', () => {
      LINKS.forEach(link => {
        expect(link).toHaveProperty('name');
        expect(link).toHaveProperty('href');
        expect(typeof link.name).toBe('string');
        expect(typeof link.href).toBe('string');
        expect(link.name.length).toBeGreaterThan(0);
        expect(link.href.length).toBeGreaterThan(0);
      });
    });

    it('should contain expected navigation items', () => {
      const expectedLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Projects', href: '#projects' },
        { name: 'Skills', href: '#skills' },
        { name: 'Experiences', href: '#experiences' }
      ];

      expect(LINKS).toEqual(expectedLinks);
    });

    it('should have unique names for all links', () => {
      const names = LINKS.map(link => link.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have unique hrefs for all links', () => {
      const hrefs = LINKS.map(link => link.href);
      const uniqueHrefs = [...new Set(hrefs)];
      expect(hrefs.length).toBe(uniqueHrefs.length);
    });

    it('should have hash-based navigation hrefs', () => {
      LINKS.forEach(link => {
        expect(link.href).toMatch(/^#[a-z-]+$/);
      });
    });
  });
});
