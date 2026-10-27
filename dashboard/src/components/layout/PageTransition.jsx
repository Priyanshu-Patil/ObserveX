import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import styles from '../../styles/modules/layout/PageTransition.module.scss';

export function PageTransition({ children, pageKey, className, mode = 'wait' }) {
    const location = useLocation();
    const shouldReduceMotion = useReducedMotion();
    const currentKey = pageKey || location.pathname;

    const variants = shouldReduceMotion
        ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
          }
        : {
              initial: {
                  opacity: 0,
                  y: 10,
                  scale: 0.996,
                  filter: 'blur(3px)',
              },
              animate: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  transition: {
                      duration: 0.26,
                      ease: [0.22, 1, 0.36, 1],
                  },
              },
              exit: {
                  opacity: 0,
                  y: -6,
                  scale: 0.996,
                  filter: 'blur(2px)',
                  transition: {
                      duration: 0.16,
                      ease: [0.22, 1, 0.36, 1],
                  },
              },
          };

    return (
        <AnimatePresence mode={mode}>
            <motion.div
                key={currentKey}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`${styles.pageTransitionWrapper} ${className || ''}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

export default PageTransition;
