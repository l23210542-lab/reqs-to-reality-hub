-- Contrato de ejemplo para el primer usuario registrado (solo desarrollo local).
insert into public.contratos (user_id, titulo, codigo_fuente)
select u.id,
       'Préstamo de ejemplo',
       E'MONEDA: USD\nCAPITAL: 10000\nTASA_ANUAL: 12.5%\nPLAZO: 6 MESES'
from auth.users u
order by u.created_at
limit 1
on conflict do nothing;
