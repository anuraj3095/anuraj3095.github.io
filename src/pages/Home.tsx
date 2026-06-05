
import { 
  HeroCard, 
  ProfessionalCard, 
  FinanceCard, 
  MachinesCard, 
  GamesCard, 
  CookingCard 
} from '../components/BentoCards';

const Home = () => {
  return (
    <div className="bento-container">
      <HeroCard />
      <ProfessionalCard />
      <FinanceCard />
      <MachinesCard />
      <GamesCard />
      <CookingCard />
    </div>
  );
};

export default Home;
