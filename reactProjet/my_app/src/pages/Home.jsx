import { motion } from 'framer-motion';
import { Header } from "../components/home/header"
import { HeroSection } from "../components/home/hero"
import { FeaturesSection } from "../components/home/feature"
import { ConciergeSection } from "../components/home/Concierge"
import CommentCaMarche from "../components/home/stape"
import ActivitesRecentes from "../components/home/ActivitesRecentes"
import Tarification from "../components/home/tarification"
import Footer from "../components/home/footer"
import LogosConfiance from "../components/home/partenaire"

const sectionAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
};

export function Home(){

    return(
        <section>
            <motion.header
                className="sticky top-0 z-50"
                initial="hidden"
                animate="visible"
                variants={sectionAnimation}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Header/>
            </motion.header>

            <section>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                >
                    <HeroSection/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                >
                    <FeaturesSection/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                >
                    <ConciergeSection/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                >
                    <CommentCaMarche/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
                >
                    <ActivitesRecentes/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
                >
                    <Tarification/>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionAnimation}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.7 }}
                >
                    <LogosConfiance/>
                </motion.div>
            </section>

            <footer>
                <Footer/>
            </footer>
        </section>
    )
}