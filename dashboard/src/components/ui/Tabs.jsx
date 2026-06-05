import { useState } from 'react';
import { cn } from '../../lib/utils';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function Tabs({ tabs, defaultTab, onChange }) {
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

    const handleTab = (id) => {
        setActive(id);
        onChange?.(id);
    };

    const current = tabs.find((t) => t.id === active);

    return (
        <div>
            <div className={styles.tabsList} role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active === tab.id}
                        className={cn(styles.tab, active === tab.id && styles.active)}
                        onClick={() => handleTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className={styles.tabPanel} role="tabpanel">
                {current?.content}
            </div>
        </div>
    );
}
