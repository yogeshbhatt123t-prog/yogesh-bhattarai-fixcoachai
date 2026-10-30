/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Procedure } from '../types';

export const CURATED_PROCEDURES: Procedure[] = [
  // ==================== ELECTRICAL ====================
  {
    id: 'elec-001',
    trade: 'electrical',
    title: 'Main Breaker Lockout & Sub-Panel Inspection',
    category: 'Distribution Panels',
    content: 'Safe procedure for de-energizing, locking out, tagging, and verifying zero voltage before servicing residential/commercial panel boards.',
    safety_critical: true,
    safety_tags: ['live_power', 'arc_flash', 'lockout_tagout'],
    tools_required: ['CAT-III 600V Multimeter or Non-Contact Voltage Tester', 'Lockout/Tagout hasp & padlock', 'Insulated screwdrivers (1000V rated)'],
    ppe_required: ['Arc-rated face shield', 'Leather over dielectric gloves', 'NFPA 70E safety glasses'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'De-energize Main Feed',
        instruction: 'Move upstream main disconnect breaker firmly to OFF position. If dual-fed or solar back-fed, open rapid shutdown and inverter disconnects.',
        safety_note: 'MANDATORY HARD STOP: Treat all conductors as live until multi-point zero voltage is proven with a calibrated tester.',
        requires_confirmation: true,
        confirmation_prompt: 'Did you switch OFF the main disconnect and attach your personal Lockout/Tagout hasp?',
        tools_needed: ['Lockout padlock & danger tag'],
        warnings: ['Do not rely on indicator lights alone. Confirm physical mechanical opening.']
      },
      {
        step_number: 2,
        title: 'Perform Live-Dead-Live Voltage Verification',
        instruction: 'Test your meter on a known live source, verify panel busbars and breaker lugs read 0.00V AC/DC across all phases and to ground, then re-test meter on the known live source.',
        safety_note: 'Three-point verification prevents false-negative readings caused by blown internal meter fuses.',
        requires_confirmation: true,
        confirmation_prompt: 'Did your meter confirm 0.00V on all lugs and pass the Live-Dead-Live check?',
        tools_needed: ['Calibrated CAT-III Multimeter']
      },
      {
        step_number: 3,
        title: 'Inspect Lug Torque & Thermal Discoloration',
        instruction: 'Inspect busbars for pitting, oxidation, or heat bluing. Use a calibrated torque screwdriver to torque lugs to manufacturer specification stamped on panel door.',
        safety_note: 'Avoid touching bare aluminum conductors without anti-oxidant compound if replacing wiring.'
      },
      {
        step_number: 4,
        title: 'Re-cover Deadfront Before Re-energizing',
        instruction: 'Replace panel deadfront barrier completely and tighten all screws before restoring power. Stand to the side (off to the hinge side) when flipping main back ON.',
        safety_note: 'Arc blast deflection: Never stand directly in front of the panel door during re-energization.'
      }
    ]
  },
  {
    id: 'elec-002',
    trade: 'electrical',
    title: 'GFCI Receptacle Troubleshooting & Replacement',
    category: 'Branch Circuits',
    content: 'Diagnosing tripped ground fault circuit interrupters, open neutrals, reverse polarity, and line vs load wire confusion.',
    safety_critical: true,
    safety_tags: ['live_power', 'ground_fault'],
    tools_required: ['GFCI Circuit Tester', 'Non-contact voltage detector', 'Wire strippers', 'Lineman pliers'],
    ppe_required: ['Safety glasses', 'Insulated work gloves'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Trip Circuit Breaker & Verify Zero Energy',
        instruction: 'Locate circuit breaker supplying the outlet. Switch off and verify with non-contact tester inserted into both hot slots.',
        safety_note: 'HARD STOP: Multi-wire branch circuits (shared neutrals) can carry dangerous return currents even if one breaker is off.',
        requires_confirmation: true,
        confirmation_prompt: 'Have you verified 0 volts with your tester?'
      },
      {
        step_number: 2,
        title: 'Identify LINE vs LOAD Terminals',
        instruction: 'Inspect existing wiring. The yellow warning tape on the new GFCI covers the LOAD terminals. Connect incoming power only to LINE (brass screw = hot black, silver screw = neutral white).',
        tools_needed: ['Wire strippers']
      },
      {
        step_number: 3,
        title: 'Secure Ground & Seat in Box',
        instruction: 'Connect green/bare ground conductor to green grounding screw. Fold conductors accordion style into box so bare ground cannot touch hot screw terminals.',
        safety_note: 'Wrap perimeter of GFCI with electrical tape across terminals for tight metal gang boxes.'
      },
      {
        step_number: 4,
        title: 'Power Up and Test Trip / Reset Mechanism',
        instruction: 'Re-energize breaker. Press RESET button. Plug in 3-prong GFCI tester and press test button to confirm trip within 25ms.',
        tools_needed: ['GFCI Circuit Tester']
      }
    ]
  },

  // ==================== PLUMBING ====================
  {
    id: 'plumb-001',
    trade: 'plumbing',
    title: 'Water Heater Pressure Relief (T&P) Valve Replacement',
    category: 'Water Heaters',
    content: 'Procedure for replacing leaking or failed Temperature & Pressure relief valves on residential tank water heaters under pressure.',
    safety_critical: true,
    safety_tags: ['pressure', 'scalding_water', 'live_power', 'gas'],
    tools_required: ['10-inch pipe wrench or crescent', 'Teflon thread seal tape', 'Pipe dope', 'Bucket and drain hose'],
    ppe_required: ['Heat-resistant gloves', 'Full safety glasses/splash shield'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Isolate Power / Gas Supply',
        instruction: 'For electric: switch off breaker at main panel. For gas: turn thermostat control knob to PILOT or OFF. Close cold water inlet shutoff valve completely.',
        safety_note: 'HARD STOP: Water in tank is under high pressure (up to 150 PSI) and extreme heat (140°F+). Never remove valve while pressurized.',
        requires_confirmation: true,
        confirmation_prompt: 'Did you shut off electrical/gas supply AND close the cold water supply valve?'
      },
      {
        step_number: 2,
        title: 'Depressurize and Drain 5-10 Gallons',
        instruction: 'Connect drain hose to bottom boiler drain valve. Open nearest hot water faucet to relieve vacuum, then crack the existing T&P test lever gently until tank water drops below the T&P port level.',
        safety_note: 'Direct discharge into drain or bucket. Scald hazard: water will discharge at extreme temperatures.',
        requires_confirmation: true,
        confirmation_prompt: 'Is tank fully depressurized and water level drained below valve?'
      },
      {
        step_number: 3,
        title: 'Remove Discharge Tube & Defective Valve',
        instruction: 'Unthread 3/4" copper/CPVC discharge pipe from valve. Using pipe wrench, turn valve counterclockwise to unscrew from tank tapping.',
        tools_needed: ['Pipe wrench']
      },
      {
        step_number: 4,
        title: 'Install New 150 PSI / 210°F Rated T&P Valve',
        instruction: 'Apply 4-5 wraps of PTFE tape clockwise plus paste dope to male threads of new ASME-certified valve. Thread into tank and torque until snug with discharge port pointing down.',
        safety_note: 'Discharge tube must terminate within 6 inches of floor and cannot be threaded at end.'
      },
      {
        step_number: 5,
        title: 'Refill Tank and Check for Weeping',
        instruction: 'Close bottom drain valve. Open cold water supply. Keep highest hot water faucet open until continuous solid stream flows (air purged). Inspect threads with flashlight for leaks.'
      }
    ]
  },
  {
    id: 'plumb-002',
    trade: 'plumbing',
    title: 'Kitchen Sink P-Trap & Garbage Disposal Clog Cleared',
    category: 'Drainage & Waste',
    content: 'Step-by-step disassembly of slip-joint traps, mechanical augering, and disposal reset.',
    safety_critical: false,
    safety_tags: ['biological_waste', 'chemical_exposure'],
    tools_required: ['Channel lock slip-joint pliers', 'Drain catch bucket', 'Hex wrench (1/4")', 'Hand drum auger'],
    ppe_required: ['Nitrile gloves', 'Splash safety glasses'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Disconnect Power to Disposal',
        instruction: 'Unplug garbage disposal under sink or switch off dedicated breaker. Confirm power is off before placing any tool near disposal throat.',
        safety_note: 'Never place hands or fingers inside disposal chamber.',
        requires_confirmation: true,
        confirmation_prompt: 'Is the garbage disposal unplugged?'
      },
      {
        step_number: 2,
        title: 'Loosen Slip Nuts and Inspect P-Trap',
        instruction: 'Place bucket under trap. Loosen the two slip nuts with channel locks. Inspect the J-bend for grease clogs, foreign objects, or mineral blockages.',
        tools_needed: ['Channel locks', 'Catch bucket']
      },
      {
        step_number: 3,
        title: 'Snake Wall Tube Sanitary Tee if Needed',
        instruction: 'If trap was clear, insert 1/4" drum auger into the wall arm pipe. Feed 6-10 feet past the sanitary tee while rotating drum clockwise to retrieve hair/sludge stoppage.',
        tools_needed: ['Hand drum auger']
      },
      {
        step_number: 4,
        title: 'Reassemble with New Poly Washers',
        instruction: 'Inspect beveled rubber/poly washer orientation (beveled edge points toward receiving fitting). Hand tighten slip nuts plus 1/4 turn with pliers. Run hot water for 3 minutes to test for leaks.'
      }
    ]
  },

  // ==================== HVAC ====================
  {
    id: 'hvac-001',
    trade: 'hvac',
    title: 'Condenser Dual Run Capacitor Replacement',
    category: 'Outdoor Condenser Units',
    content: 'Safely discharging high voltage capacitor (370V/440V), measuring microfarad ratings (HERM/FAN/C), and wiring new unit.',
    safety_critical: true,
    safety_tags: ['stored_electrical_energy', 'live_power'],
    tools_required: ['Insulated 20k-ohm 5W discharge resistor or insulated screwdriver', 'Digital Multimeter with capacitance (uF)', 'Nut drivers 1/4" and 5/16"', 'Needle-nose pliers'],
    ppe_required: ['Dielectric gloves', 'Safety glasses'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Pull Disconnect Handle at Condenser',
        instruction: 'Locate outdoor service disconnect switch next to condenser. Pull the disconnect block out or flip breaker to OFF. Verify indoor thermostat is set to OFF.',
        safety_note: 'HARD STOP: Capacitors store lethal voltage even after disconnect is pulled! You must manually bleed charge before touch.',
        requires_confirmation: true,
        confirmation_prompt: 'Did you pull the electrical disconnect switch at the outdoor unit?',
        tools_needed: ['Lockout tag']
      },
      {
        step_number: 2,
        title: 'Bleed Stored Charge from Capacitor Terminals',
        instruction: 'Bridge each terminal (HERM to C, and FAN to C) using an insulated bleeder resistor or an insulated shaft screwdriver across terminals for 5 seconds.',
        safety_note: 'Do not touch metal shaft of tool. A loud pop or spark indicates sudden discharge.',
        requires_confirmation: true,
        confirmation_prompt: 'Have you discharged HERM to C and FAN to C terminals?'
      },
      {
        step_number: 3,
        title: 'Label Wires and Measure Microfarads',
        instruction: 'Tag wires: C (Common, yellow/black), HERM (Hermetic compressor, purple/orange), FAN (Condenser fan motor, brown). Set multimeter to MFD/uF. Verify readings are within ±5% or ±6% of nominal rating on can label.',
        tools_needed: ['Digital Multimeter (MFD mode)']
      },
      {
        step_number: 4,
        title: 'Mount Replacement and Re-connect',
        instruction: 'Ensure voltage rating of replacement meets or exceeds original (e.g., 440VAC replaces 370VAC, never vice-versa). Reconnect terminals firmly using pliers to pinch spade connectors if loose.'
      },
      {
        step_number: 5,
        title: 'Restore Disconnect and Verify Amp Draw',
        instruction: 'Replace electrical access door. Insert outdoor disconnect. Check compressor start-up sound and fan rotation direction. Measure run amps with clamp meter.'
      }
    ]
  },
  {
    id: 'hvac-002',
    trade: 'hvac',
    title: 'Gas Furnace Igniter & Flame Sensor Service',
    category: 'Gas Heating',
    content: 'Cleaning carbonized flame rectification sensor and diagnosing hot surface igniter resistance on high-efficiency gas furnaces.',
    safety_critical: true,
    safety_tags: ['gas', 'live_power', 'combustion'],
    tools_required: ['1/4" magnetic nut driver', '0000 Ultra-fine steel wool / Scotch-Brite', 'Multimeter (micro-amps DC and ohms)', 'Flashlight'],
    ppe_required: ['Safety glasses', 'Mechanics gloves'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Switch Off Furnace Service Switch & Gas Cock',
        instruction: 'Flip the 120V toggle service switch on side of furnace to OFF. Close gas isolation valve handle 90° perpendicular to pipe.',
        safety_note: 'HARD STOP: Combustible natural gas / LP hazard. Never perform burner maintenance with gas valve energized.',
        requires_confirmation: true,
        confirmation_prompt: 'Is 120V power switch OFF and manual gas valve closed 90°?'
      },
      {
        step_number: 2,
        title: 'Remove and Polish Flame Rod',
        instruction: 'Locate flame rod opposite of hot surface igniter. Remove 1/4" retaining screw. Gently clean metal rod with dry 0000 steel wool to remove non-conductive silica/carbon film. Never use sandpaper (leaves ceramic residue).',
        tools_needed: ['1/4" magnetic nut driver', '0000 steel wool']
      },
      {
        step_number: 3,
        title: 'Test Hot Surface Igniter Resistance',
        instruction: 'Unclip igniter molex plug. Measure resistance across pins. Silicon carbide igniters should read 40-100 ohms; silicon nitride igniters read 10-20 ohms. Infinite/open circuit indicates cracked element.',
        tools_needed: ['Multimeter (Ohms)']
      },
      {
        step_number: 4,
        title: 'Reinstall, Fire Furnace, and Verify Flame Signal',
        instruction: 'Reattach flame sensor wire, open gas cock, restore power, set thermostat to call for heat. Use meter in series on uA DC mode to verify flame signal is between 1.5uA and 5.0uA.'
      }
    ]
  },

  // ==================== WELDING ====================
  {
    id: 'weld-001',
    trade: 'welding',
    title: 'Oxy-Acetylene Torch Setup & Leak Testing',
    category: 'Gas Cutting & Brazing',
    content: 'Critical procedure for setting cylinder pressures, inspecting flash arrestors, and leak checking fuel gas lines.',
    safety_critical: true,
    safety_tags: ['gas', 'flammable_fuel', 'high_pressure_cylinder'],
    tools_required: ['Approved non-oil bubble leak test solution (Snoop)', 'Cylinder wrench', 'Friction striker (never use matches/lighters)'],
    ppe_required: ['Shade 5 cutting goggles', 'Split leather welding jacket & gauntlets', 'Steel-toe boots'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Inspect Cylinders and Ensure Upright Chaining',
        instruction: 'Acetylene cylinders must stand upright for at least 30 minutes before use so liquid acetone stabilizes. Check regulators for oil or grease contamination.',
        safety_note: 'HARD STOP: Oil or grease in contact with high-pressure oxygen will cause violent instantaneous explosion without spark.',
        requires_confirmation: true,
        confirmation_prompt: 'Are cylinders chained upright, and are all valves/fittings 100% free of oil/grease?'
      },
      {
        step_number: 2,
        title: 'Crack Valves and Attach Regulators',
        instruction: 'Momentarily crack cylinder valves to blow dust out. Connect oxygen regulator (right-hand thread) and acetylene regulator (notched nuts, left-hand thread). Tighten with dedicated cylinder wrench.',
        tools_needed: ['Cylinder wrench']
      },
      {
        step_number: 3,
        title: 'Perform Pressure Bubble Leak Test',
        instruction: 'Slowly open oxygen valve fully (back-seating valve). Open acetylene cylinder 3/4 turn only. Apply leak check solution around cylinder stems, regulator nuts, hose connections, and torch body.',
        safety_note: 'Never exceed 15 PSI working pressure on acetylene gauge! Pure acetylene becomes chemically unstable above 15 PSI.',
        requires_confirmation: true,
        confirmation_prompt: 'Did all fittings pass the bubble leak test with 0 bubbles, and acetylene is set below 15 PSI?',
        tools_needed: ['Bubble leak solution']
      },
      {
        step_number: 4,
        title: 'Purge Lines and Light with Striker',
        instruction: 'Purge oxygen and fuel lines individually for 3-5 seconds. Open acetylene valve 1/8 turn on torch, light with friction spark striker, increase fuel until smoke disappears, then add oxygen to achieve neutral cone.'
      }
    ]
  },

  // ==================== CARPENTRY ====================
  {
    id: 'carp-001',
    trade: 'carpentry',
    title: 'Load-Bearing Wall Stud Replacement & Temporary Shoring',
    category: 'Framing & Structural',
    content: 'Erecting temporary stud shoring walls before cutting or replacing damaged structural wall studs or jack studs.',
    safety_critical: true,
    safety_tags: ['structural_collapse', 'fall_hazard'],
    tools_required: ['Hydraulic bottle jack or adjustable screw jack posts', 'Framing hammer / 21-degree framing nailer', 'Speed square & level', 'Reciprocating saw with bi-metal demo blade'],
    ppe_required: ['Hard hat', 'Steel toe work boots', 'Safety glasses', 'Ear protection'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Confirm Ceiling Joist Span and Floor Loading',
        instruction: 'Identify which direction ceiling joists run. Load-bearing walls run perpendicular to floor/ceiling joists. Check for point loads from roof trusses directly above.',
        safety_note: 'HARD STOP: Never remove framing members in multi-story or roof-supporting walls without temporary shoring walls on both sides if applicable.',
        requires_confirmation: true,
        confirmation_prompt: 'Have you verified the structural load path and framed temporary shoring under ceiling joists?'
      },
      {
        step_number: 2,
        title: 'Build Temporary Shoring Wall (Pony Wall)',
        instruction: 'Place a double top plate and single bottom plate 2 feet away from work zone. Wedge studs tightly directly underneath every joist. Shim if needed until ceiling is secured without lifting.',
        tools_needed: ['Level', 'Framing nailer']
      },
      {
        step_number: 3,
        title: 'Cut and Remove Damaged Stud',
        instruction: 'Cut through center of damaged stud with reciprocating saw. Pry outward to disengage top and bottom toe-nails without marring neighboring drywall or vapor barrier.',
        tools_needed: ['Reciprocating saw']
      },
      {
        step_number: 4,
        title: 'Install Sister or Replacement Stud',
        instruction: 'Cut replacement #2 or better SPF/Douglas Fir 2x4 or 2x6 to snug fit. Tap into place with sledge/hammer. Fasten with three 16d common nails top and bottom, or structural screws.'
      }
    ]
  },

  // ==================== APPLIANCE REPAIR ====================
  {
    id: 'app-001',
    trade: 'appliance',
    title: 'Washing Machine Drain Pump & Coin Trap Cleanout',
    category: 'Laundry Appliances',
    content: 'Clearing front-load washer OE/drain error codes, impeller obstructions, and water drainage.',
    safety_critical: false,
    safety_tags: ['live_power', 'slip_hazard'],
    tools_required: ['Shallow drain pan & towels', 'Pliers', 'Flashlight', 'Screwdrivers'],
    ppe_required: ['Rubber gloves', 'Non-slip boots'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Unplug Appliance from Wall Outlet',
        instruction: 'Disconnect 120V electrical cord from wall receptacle before opening bottom pump access door.',
        safety_note: 'Water around electrical plugs is a shock hazard. Dry area first if standing in water.',
        requires_confirmation: true,
        confirmation_prompt: 'Is the washer unplugged from electrical power?'
      },
      {
        step_number: 2,
        title: 'Drain Standing Water via Emergency Hose',
        instruction: 'Open lower access panel. Pull out small emergency drain hose, place into catch pan, pull plug to drain remaining gallons inside drum.',
        tools_needed: ['Catch pan', 'Towels']
      },
      {
        step_number: 3,
        title: 'Unscrew Filter Assembly and Clear Impeller',
        instruction: 'Turn large filter knob counterclockwise. Remove hairpins, coins, or lint. Reach finger into pump cavity and spin impeller blade by hand to verify smooth magnetic resistance.'
      },
      {
        step_number: 4,
        title: 'Seat O-Ring and Test Spin Cycle',
        instruction: 'Lubricate black O-ring seal, screw filter back tightly to prevent catastrophic flood. Plug unit in, run rinse & spin cycle, check for leaks.'
      }
    ]
  },

  // ==================== ROOFING ====================
  {
    id: 'roof-001',
    trade: 'roofing',
    title: 'Chimney Step Flashing & Counter-Flashing Repair',
    category: 'Flashing & Waterproofing',
    content: 'Replacing rusted galvanized or aluminum step flashing, mortar reglet counter-flashing, and storm sealant application.',
    safety_critical: true,
    safety_tags: ['fall_hazard', 'heights', 'respiratory_silica'],
    tools_required: ['OSHA Compliant Fall Arrest Harness & Anchor', 'Angle grinder with masonry diamond blade', 'Tin snips', 'Prying bar'],
    ppe_required: ['Safety harness & lanyard', 'N95/P100 respirator for silica dust', 'Roofing footwear with cougar paws or high-traction soles'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Establish OSHA-Approved Fall Protection Anchor',
        instruction: 'Install roof ridge anchor into structural rafter with specified timber screws. Connect full-body harness and rope grab before approaching chimney on pitch > 4:12.',
        safety_note: 'HARD STOP: Fall hazards are the #1 cause of fatal accidents on jobsites. Never proceed on roof without tie-off.',
        requires_confirmation: true,
        confirmation_prompt: 'Are you 100% tied off to a certified structural roof anchor?'
      },
      {
        step_number: 2,
        title: 'Pry Damaged Shingles and Expose Step Flashing',
        instruction: 'Carefully break sealant bond on surrounding shingles using flat pry bar without tearing shingle tabs. Remove nails holding corroded step flashing.',
        tools_needed: ['Pry bar', 'Tin snips']
      },
      {
        step_number: 3,
        title: 'Cut 1-inch Reglet Groove in Chimney Mortar',
        instruction: 'Using diamond wheel angle grinder with vacuum/respirator, cut a 1" deep groove into mortar joint for new counter-flashing.',
        safety_note: 'Silica dust hazard: wear fitted respirator.'
      },
      {
        step_number: 4,
        title: 'Step Layer Shingles and New Flashing with Ice/Water Barrier',
        instruction: 'Interweave each metal step flashing with consecutive shingle courses (3" overlap). Fasten with galvanized roofing nails placed high under shingle cover. Bed counter-flashing into reglet with polyurethane sealant.'
      }
    ]
  },

  // ==================== GENERAL MAINTENANCE ====================
  {
    id: 'maint-001',
    trade: 'general_maintenance',
    title: 'Commercial Door Closer Hydraulic Adjustment & Arm Fix',
    category: 'Commercial Hardware',
    content: 'Tuning closing speed (Sweep), latching speed (Latch), backcheck resistance, and fixing sagging pivot arm.',
    safety_critical: false,
    safety_tags: ['pinch_point'],
    tools_required: ['Allen key set (3/32", 1/8")', 'Flat screwdriver', 'Phillips #3 screwdriver'],
    ppe_required: ['Safety glasses', 'Mechanics gloves'],
    offline_cacheable: true,
    steps: [
      {
        step_number: 1,
        title: 'Inspect Body for Hydraulic Oil Weeping',
        instruction: 'Inspect lower casing of door closer body for oil droplets. If oil is dripping from spindle or adjust valves, the internal seals are blown and the entire unit must be replaced.',
        safety_note: 'A blown closer can slam violently in heavy wind, causing severe finger amputations.'
      },
      {
        step_number: 2,
        title: 'Adjust Sweep Speed Valve (Valve S)',
        instruction: 'Locate Valve S. Turn clockwise to slow door closing from 90° down to 10°. Turn counterclockwise to speed up. Turn only 1/8th of a turn at a time.',
        tools_needed: ['Allen key / Flat screwdriver']
      },
      {
        step_number: 3,
        title: 'Adjust Latch Speed Valve (Valve L)',
        instruction: 'Locate Valve L. Adjust so that door closes firmly enough to engage latch bolt in strike plate without loud slamming (last 10° of travel).'
      },
      {
        step_number: 4,
        title: 'Adjust Backcheck (Valve BC) for Wind Dampening',
        instruction: 'Valve BC cushions door opening past 70° to prevent wall strikes. Never back out any valve screw more than 2 full turns from seated to avoid blowout.'
      }
    ]
  }
];
