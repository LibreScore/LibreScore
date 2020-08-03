
import { popoverController } from '@ionic/vue/dist/index'

export const showPopover = async (ev: MouseEvent, slot: HTMLElement): Promise<void> => {
  const popover = await popoverController.create({
    component: slot,
    event: ev,
    showBackdrop: true,
  })
  await popover.present()
}

export const PopoverMixin = {
  methods: {
    showPopover (ev: MouseEvent, slot: HTMLElement): Promise<void> {
      return showPopover(ev, slot)
    },
  },
}

export default PopoverMixin
