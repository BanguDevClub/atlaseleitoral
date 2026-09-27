import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { url } from '@/lib/base';

type LinkButtonProps = Omit<ComponentProps<typeof Button>, 'render'> & { href: string };

/**
 * Base UI `render` needs a real React element, which .astro templates cannot create.
 * Use this in Astro pages instead of <Button render={<a …/>}>.
 */
export default function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button render={<a href={url(href)} />} {...props}>
      {children}
    </Button>
  );
}
