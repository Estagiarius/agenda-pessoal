from experiment_simulator.simulator_core.engine import SimulationEngine
from experiment_simulator.experiments.chemistry.titration import TitrationExperiment

if __name__ == "__main__":
    # Create an instance of SimulationEngine
    engine = SimulationEngine()

    # Create an instance of TitrationExperiment with default values
    titration_exp = TitrationExperiment()

    # Run the experiment
    results = engine.run_experiment(titration_exp)

    # Print the results in a user-friendly format
    print("\nTitration Experiment Results:")
    print(f"  Titrant Volume Added: {results['titrant_volume_added']:.1f} mL")
    print(f"  Final pH: {results['final_ph']:.1f}")
    print(f"  Analyte Volume: {results['analyte_volume']:.1f} mL")
    print(f"  Analyte Concentration: {results['analyte_concentration']:.1f} M")
    print(f"  Titrant Concentration: {results['titrant_concentration']:.1f} M")
