import { 
  HeroCard, 
  ProfessionalCard, 
  FinanceCard, 
  MachinesCard, 
  GamesCard, 
  CookingCard, 
  BrainCard 
} from '../components/BentoCards';

const Home = () => {
  return (
    <div className="bento-container">
      <HeroCard />
      <ProfessionalCard />
      <BrainCard />
      <FinanceCard />
      <MachinesCard />
      <GamesCard />
      <CookingCard />
    </div>
  );
};

export default Home;
