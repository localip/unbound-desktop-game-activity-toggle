import { bind, classnames, findInReactTree } from '@utilities';
import { Locale } from '@webpack/common';
import { bulk, filters } from '@webpack';
import Plugin from '@entities/plugin';
import React from 'react';

import Joystick from './components/Joystick';
import { Menu } from '@components/discord';

const [
   Settings,
   Classes,
   MenuClasses,
   Checkbox,
   CheckboxChecked
] = bulk(
   filters.byProps('ShowCurrentGame'),
   m => m.statusItem && !m.menu,
   filters.byProps('styleFixed', 'menu'),
   m => m.default?.displayName === 'Checkbox' && !m.default.Shapes,
   filters.byDisplayName('CheckboxChecked', false),
   { bulk: true }
);

export default class extends Plugin {
   start() {
      this.patcher.before(Menu, 'default', (_, args) => {
         const props = args[0];

         if (props?.navId !== 'status-picker' && props?.navId !== 'account') {
            return args;
         }

         if (props.navId === 'status-picker') {
            const invisible = props.children.find(c => c.props.id === 'invisible');
            const idx = props.children.indexOf(invisible);

            if (!props.children.find(c => c?.props?.id == 'game-activity-toggle')) {
               const enabled = Settings.ShowCurrentGame.getSetting();

               props.children.splice(idx + 1, 0,
                  <Menu.MenuSeparator />,
                  <Menu.MenuCheckboxItem
                     id='game-activity-toggle'
                     keepItemStyles={true}
                     action={this.onToggleClicked}
                     checked={enabled}
                     label={<div style={{ padding: 0 }} className={Classes.statusItem}>
                        <Joystick width={18} height={18} />
                        <div className={Classes.status}>
                           {Locale.Messages.ACTIVITY_STATUS}
                        </div>
                     </div>}
                  />
               );
            }
         } else {
            const status = findInReactTree(props, c => c.props?.children?.find?.(p => p.key === 'status-picker'));
            const idx = status.props.children.findIndex(c => c.key === 'status-picker');

            if (!status.props.children.find(c => c?.props?.id == 'game-activity-toggle')) {
               const enabled = Settings.ShowCurrentGame.getSetting();

               status.props.children.splice(idx + 1, 0,
                  <Menu.MenuSeparator />,
                  <Menu.MenuItem
                     id='game-activity-toggle'
                     action={this.onToggleClicked}
                     role='menuitemcheckbox'
                     tabIndex={-1}
                     render={() => <div
                        className={classnames(MenuClasses.labelContainer, MenuClasses.colorDefault, MenuClasses.item)}
                        onMouseEnter={e => e.target.classList.add(MenuClasses.focused)}
                        onMouseLeave={e => e.target.classList.remove(MenuClasses.focused)}
                     >
                        <div className={MenuClasses.iconContainerLeft}>
                           <Joystick style={{ marginLeft: -2 }} width={18} height={18} />
                        </div>
                        <div className={MenuClasses.label}>
                           {Locale.Messages.ACTIVITY_STATUS}
                        </div>
                        <div className={MenuClasses.iconContainer}>
                           {enabled ? <CheckboxChecked.default
                              className={MenuClasses.icon}
                              background={MenuClasses.checkbox}
                              foreground={MenuClasses.check}
                           /> : <Checkbox.default
                              className={MenuClasses.icon}
                              foreground={MenuClasses.checkboxEmpty}
                           />}
                        </div>
                     </div>}
                  />
               );
            }
         }
      });
   }

   @bind
   onToggleClicked() {
      const previous = Settings.ShowCurrentGame.getSetting();
      Settings.ShowCurrentGame.updateSetting(!previous);
   }
}
