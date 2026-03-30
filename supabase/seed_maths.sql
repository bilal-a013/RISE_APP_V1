-- ============================================================
-- RISE — GCSE Maths Seed Data (Edexcel Specification)
-- File: supabase/seed_maths.sql
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING
-- ============================================================


-- ============================================================
-- TOPICS
-- ============================================================

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Number', 'number', 1
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Algebra', 'algebra', 2
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Ratio, Proportion and Rates of Change', 'ratio-proportion-rates-of-change', 3
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Geometry and Measures', 'geometry-and-measures', 4
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Probability', 'probability', 5
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;

insert into public.topics (subject_id, name, slug, order_index)
select s.id, 'Statistics', 'statistics', 6
from public.subjects s where s.slug = 'maths'
on conflict (subject_id, slug) do nothing;


-- ============================================================
-- LESSONS — NUMBER
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Place Value, Ordering and Rounding',
  'place-value-ordering-rounding',
  'learn', 'foundation', 1, 20,
  array[
    'Read, write and interpret numbers up to one billion using place value',
    'Order and compare positive and negative integers, decimals and fractions',
    'Round numbers to a given number of decimal places or significant figures'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Fractions — Adding and Subtracting',
  'fractions-adding-subtracting',
  'learn', 'foundation', 2, 25,
  array[
    'Find a common denominator to add and subtract fractions',
    'Add and subtract mixed numbers by converting to improper fractions',
    'Simplify fractions to their lowest terms using HCF'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Fractions — Multiplying and Dividing',
  'fractions-multiplying-dividing',
  'learn', 'foundation', 3, 20,
  array[
    'Multiply fractions and mixed numbers, simplifying where possible',
    'Divide fractions using the keep-change-flip (KCF) method',
    'Apply fraction multiplication and division to solve word problems'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Percentages — Finding and Converting',
  'percentages-finding-converting',
  'learn', 'foundation', 4, 25,
  array[
    'Convert fluently between fractions, decimals and percentages',
    'Calculate a percentage of an amount with and without a calculator',
    'Express one quantity as a percentage of another'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Powers, Roots and BIDMAS',
  'powers-roots-bidmas',
  'learn', 'foundation', 5, 20,
  array[
    'Calculate squares, cubes and their roots without a calculator',
    'Apply the correct order of operations (BIDMAS) to multi-step calculations',
    'Use index notation and express numbers as products of their powers'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Prime Factors, HCF and LCM',
  'prime-factors-hcf-lcm',
  'learn', 'foundation', 6, 25,
  array[
    'Express any integer as a product of its prime factors using a factor tree',
    'Find the Highest Common Factor (HCF) of two or more numbers',
    'Find the Lowest Common Multiple (LCM) of two or more numbers'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'number' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;


-- ============================================================
-- LESSONS — ALGEBRA
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Simplifying and Expanding Expressions',
  'simplifying-expanding-expressions',
  'learn', 'foundation', 1, 20,
  array[
    'Collect like terms to simplify algebraic expressions',
    'Expand single and double brackets correctly',
    'Recognise and apply the difference of two squares'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Solving Linear Equations',
  'solving-linear-equations',
  'learn', 'foundation', 2, 25,
  array[
    'Solve one-step and two-step linear equations using inverse operations',
    'Solve equations with unknowns on both sides',
    'Form and solve equations from written or geometric contexts'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Sequences and the nth Term',
  'sequences-nth-term',
  'learn', 'foundation', 3, 20,
  array[
    'Identify and continue arithmetic and geometric sequences',
    'Find the nth term formula for a linear sequence',
    'Determine whether a given number is a term in a sequence'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Straight-Line Graphs',
  'straight-line-graphs',
  'learn', 'foundation', 4, 25,
  array[
    'Plot straight-line graphs from a table of values',
    'Identify the gradient and y-intercept from y = mx + c',
    'Find the equation of a line given two points or a point and gradient'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Factorising Expressions',
  'factorising-expressions',
  'learn', 'foundation', 5, 20,
  array[
    'Factorise expressions by taking out a common factor',
    'Factorise quadratic expressions of the form x² + bx + c',
    'Use factorisation to solve simple quadratic equations'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Simultaneous Equations',
  'simultaneous-equations',
  'learn', 'foundation', 6, 30,
  array[
    'Solve a pair of simultaneous linear equations by elimination',
    'Solve a pair of simultaneous equations by substitution',
    'Interpret the solution of simultaneous equations as the intersection of two lines'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'algebra' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;


-- ============================================================
-- LESSONS — RATIO, PROPORTION AND RATES OF CHANGE
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Ratio — Simplifying and Sharing',
  'ratio-simplifying-sharing',
  'learn', 'foundation', 1, 20,
  array[
    'Write and simplify ratios including three-part ratios',
    'Divide a quantity into a given ratio',
    'Solve problems involving ratios in real-life contexts such as recipes and maps'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'ratio-proportion-rates-of-change' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Direct and Inverse Proportion',
  'direct-inverse-proportion',
  'learn', 'foundation', 2, 25,
  array[
    'Recognise and use direct proportion relationships including y = kx',
    'Solve best-value and unitary method problems using direct proportion',
    'Recognise inverse proportion and apply it to solve problems'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'ratio-proportion-rates-of-change' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Percentage Change and Reverse Percentages',
  'percentage-change-reverse-percentages',
  'learn', 'foundation', 3, 25,
  array[
    'Calculate percentage increase and decrease using multipliers',
    'Find the original value after a percentage change (reverse percentage)',
    'Apply percentage change to real-life problems including VAT, profit and loss'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'ratio-proportion-rates-of-change' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Speed, Distance and Time',
  'speed-distance-time',
  'learn', 'foundation', 4, 20,
  array[
    'Use the formula triangle to calculate speed, distance or time',
    'Convert between units of speed such as km/h and m/s',
    'Interpret distance-time and speed-time graphs'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'ratio-proportion-rates-of-change' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Scale Drawings and Maps',
  'scale-drawings-maps',
  'learn', 'foundation', 5, 15,
  array[
    'Interpret and use scales on maps and scale drawings',
    'Calculate real distances and lengths from scaled diagrams',
    'Construct scale drawings to a given ratio'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'ratio-proportion-rates-of-change' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;


-- ============================================================
-- LESSONS — GEOMETRY AND MEASURES
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Area and Perimeter of 2D Shapes',
  'area-perimeter-2d-shapes',
  'learn', 'foundation', 1, 20,
  array[
    'Calculate the perimeter and area of rectangles, triangles and parallelograms',
    'Calculate the area of compound shapes by splitting into simpler parts',
    'Solve problems involving area and perimeter in real-life contexts'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Angles and Parallel Lines',
  'angles-parallel-lines',
  'learn', 'foundation', 2, 20,
  array[
    'Identify and use angle facts: angles on a line, at a point and in a triangle',
    'Apply the properties of alternate, co-interior and corresponding angles',
    'Solve multi-step angle problems giving reasons for each step'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Pythagoras'' Theorem',
  'pythagoras-theorem',
  'learn', 'foundation', 3, 25,
  array[
    'State and apply Pythagoras'' theorem to find a missing side in a right-angled triangle',
    'Determine whether a triangle is right-angled given its three sides',
    'Apply Pythagoras'' theorem to solve problems in 2D contexts'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Transformations',
  'transformations',
  'learn', 'foundation', 4, 25,
  array[
    'Perform and describe reflections, rotations, translations and enlargements',
    'Use column vectors to describe and apply translations',
    'Identify the scale factor and centre of an enlargement'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Circles — Area and Circumference',
  'circles-area-circumference',
  'learn', 'foundation', 5, 20,
  array[
    'Calculate the circumference of a circle using C = πd or C = 2πr',
    'Calculate the area of a circle using A = πr²',
    'Find the arc length and area of a sector given an angle'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Volume of 3D Shapes',
  'volume-3d-shapes',
  'learn', 'foundation', 6, 25,
  array[
    'Calculate the volume of prisms including cubes, cuboids and cylinders',
    'Calculate the surface area of cuboids and cylinders',
    'Solve problems involving volume and capacity with unit conversions'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'geometry-and-measures' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;


-- ============================================================
-- LESSONS — PROBABILITY
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Basic Probability and the Probability Scale',
  'basic-probability-scale',
  'learn', 'foundation', 1, 15,
  array[
    'Use the probability scale from 0 to 1 to describe the likelihood of events',
    'Calculate theoretical probability using P(E) = favourable outcomes ÷ total outcomes',
    'Understand that probabilities of all outcomes in a sample space sum to 1'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'probability' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Listing Outcomes and Sample Spaces',
  'listing-outcomes-sample-spaces',
  'learn', 'foundation', 2, 20,
  array[
    'List all possible outcomes of one or two events systematically',
    'Construct and use sample space diagrams for two combined events',
    'Calculate probabilities from sample space diagrams'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'probability' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Probability Trees',
  'probability-trees',
  'learn', 'foundation', 3, 25,
  array[
    'Construct probability tree diagrams for two or more independent events',
    'Multiply along branches to find the probability of combined outcomes',
    'Add probabilities of mutually exclusive outcomes to find the probability of an event'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'probability' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Venn Diagrams and Set Notation',
  'venn-diagrams-set-notation',
  'learn', 'foundation', 4, 25,
  array[
    'Draw and interpret two-set Venn diagrams',
    'Use set notation including union (∪), intersection (∩) and complement (A'')',
    'Calculate probabilities from Venn diagrams'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'probability' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;


-- ============================================================
-- LESSONS — STATISTICS
-- ============================================================

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Averages — Mean, Median, Mode and Range',
  'averages-mean-median-mode-range',
  'learn', 'foundation', 1, 20,
  array[
    'Calculate the mean, median, mode and range from a list of values',
    'Find averages and range from a frequency table',
    'Choose and justify the most appropriate average for a given data set'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'statistics' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Charts and Diagrams — Bar, Pie and Pictograms',
  'charts-diagrams-bar-pie-pictograms',
  'learn', 'foundation', 2, 20,
  array[
    'Interpret and draw bar charts, dual bar charts and pictograms',
    'Construct and interpret pie charts by calculating sector angles',
    'Compare data sets using appropriate charts and describe findings'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'statistics' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Scatter Graphs and Correlation',
  'scatter-graphs-correlation',
  'learn', 'foundation', 3, 20,
  array[
    'Plot and interpret scatter graphs for bivariate data',
    'Describe the type and strength of correlation shown in a scatter graph',
    'Draw a line of best fit and use it to make predictions, recognising its limitations'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'statistics' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;

insert into public.lessons (topic_id, title, slug, type, tier, order_index, estimated_minutes, learning_objectives)
select t.id,
  'Cumulative Frequency and Box Plots',
  'cumulative-frequency-box-plots',
  'learn', 'foundation', 4, 30,
  array[
    'Construct and interpret cumulative frequency tables and curves',
    'Estimate the median and interquartile range from a cumulative frequency graph',
    'Draw and interpret box plots, comparing distributions using median and IQR'
  ]
from public.topics t
join public.subjects s on t.subject_id = s.id
where t.slug = 'statistics' and s.slug = 'maths'
on conflict (topic_id, slug) do nothing;
