-- Légendes mondiales MollyMine : une ligne par joueur (la dernière
-- publication remplace la précédente grâce à player_uuid).
create table if not exists records (
  player_uuid text primary key,
  pseudo varchar(20) not null,
  mineral_id text not null check (mineral_id in (
    'gray', 'clay', 'silver', 'roseQuartz', 'goldDust', 'trilobite',
    'hardRock', 'gold', 'amethyst', 'jade', 'geode',
    'basalt', 'goldBar', 'platinumBar', 'emerald', 'sapphire', 'meteorite',
    'rockQuartz', 'platinum', 'diamond', 'ruby', 'ether',
    'slag', 'blueDiamond', 'magmaGold', 'blackOpal', 'obsidian'
  )),
  grams integer not null check (grams between 1 and 6000),
  valeur integer not null check (valeur between 1 and 2000000),
  created_at timestamptz default now()
);

alter table records enable row level security;

-- Lecture publique (les deux classements).
create policy "lecture publique"
  on records for select using (true);

-- Insertion anonyme (le jeu valide déjà : minerai connu, bornes, pseudo ≤ 20).
-- Les UUID étant imprévisibles, une ligne ne peut pas être visée par hasard.
create policy "publication anonyme"
  on records for insert
  with check (char_length(pseudo) between 1 and 20);

-- Mise à jour anonyme (upsert on_conflict=player_uuid côté jeu).
create policy "mise à jour anonyme"
  on records for update
  using (true)
  with check (char_length(pseudo) between 1 and 20);
