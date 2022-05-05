import { bulk, filters } from '@webpack';
import Plugin from '@structures/plugin';
import { create } from '@patcher';
import React from 'react';

import Joystick from './components/Joystick';

const Patcher = create('game-activity-toggle');

const [
   Menu,
   Settings,
   Classes
] = bulk(
   filters.byProps('MenuItem'),
   filters.byProps('ShowCurrentGame'),
   m => m.statusItem && !m.menu
);

export default class extends Plugin {
   start() {
      Patcher.before(Menu, 'default', (_, args) => {
         const props = args[0];

         if (props?.navId !== 'status-picker') return args;

         const invisible = props.children.find(c => c.props.id === 'invisible');
         const idx = props.children.indexOf(invisible);

         if (!props.children.find(c => c?.props?.id == 'game-activity-toggle')) {
            const enabled = Settings.ShowCurrentGame.getSetting();

            props.children.splice(idx + 1, 0,
               <Menu.MenuSeparator />,
               <Menu.MenuItem
                  id='game-activity-toggle'
                  keepItemStyles={true}
                  action={this.onToggleClicked.bind(this)}
                  render={() =>
                     <div
                        className={Classes.statusItem}
                        aria-label={`${enabled ? 'Hide' : 'Show'} Game Activity`}
                     >
                        <Joystick
                           disabled={enabled}
                           width={16}
                           height={16}
                        />
                        <div className={Classes.status}>
                           {enabled ? 'Hide' : 'Show'} Game Activity
                        </div>
                        <div className={Classes.description}>
                           Display current running game as a status message.
                        </div>
                     </div>
                  }
               />
            );
         }
      });
   }

   onToggleClicked() {
      const previous = Settings.ShowCurrentGame.getSetting();
      Settings.ShowCurrentGame.updateSetting(!previous);
   }

   stop() {
      Patcher.unpatchAll();
   }
}