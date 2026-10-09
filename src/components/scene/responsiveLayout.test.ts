import { layoutScene, type SceneRect } from '@/components/scene/responsiveLayout';
import type { SceneNodeId } from '@/core/scene';

const NODES: SceneNodeId[] = ['traffic', 'loadBalancer', 'servers', 'cache', 'storage'];

function overlaps(a: SceneRect, b: SceneRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

describe('layoutScene', () => {
  it.each([320, 360, 390, 560, 768, 1280])(
    'places every node inside the stage without overlaps at %ipx',
    (width) => {
      const layout = layoutScene(width, NODES);
      const rects = NODES.map((id) => layout.rects[id]);
      for (const rect of rects) {
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(layout.width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(layout.height);
      }
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          expect(overlaps(rects[i], rects[j])).toBe(false);
        }
      }
    },
  );

  it('stacks narrow stages and hides edge labels', () => {
    const layout = layoutScene(360, NODES);
    expect(layout.mode).toBe('stacked');
    expect(layout.showEdgeLabels).toBe(false);
    expect(layout.rects.servers.y + 76).toBeLessThanOrEqual(layout.rects.cache.y);
  });

  it('uses the diagram on wide stages', () => {
    const layout = layoutScene(800, NODES);
    expect(layout.mode).toBe('diagram');
    expect(layout.showEdgeLabels).toBe(true);
  });
});
