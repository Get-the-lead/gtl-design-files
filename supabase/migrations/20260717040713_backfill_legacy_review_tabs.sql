-- Comments created before page_state was introduced were reviewed in sequence
-- across the mobile design-system tabs. Persist those known tab selections so
-- opening an older thread restores the same dynamically rendered DOM.

with legacy_tabs (id, doc_key) as (
  values
    ('32d2888e-7e57-4d78-8f48-5960497ecf3f'::uuid, 'home'),
    ('3c1fa291-4b86-4f45-989e-260d9da4ee49'::uuid, 'home'),
    ('0b4de3fd-62b6-4bdd-98c6-6e61ee4e7142'::uuid, 'home'),
    ('40e3c8d7-e9c0-4041-8155-0a3c586337a8'::uuid, 'home'),
    ('22f54e4d-3bd5-44df-9804-a6c487d66746'::uuid, 'home'),
    ('e7c50f40-fac7-463d-869e-f2b36be7e21a'::uuid, 'home'),
    ('f89cc9d7-c1bd-4931-848d-02db4a3c70f3'::uuid, 'home'),
    ('58bd640d-1c61-4118-a181-6dd005e87f14'::uuid, 'game'),
    ('e815e671-5172-451a-a215-f2e519329a93'::uuid, 'game'),
    ('ad41af3f-69d7-4b5d-87b4-9440ede89a31'::uuid, 'game'),
    ('697d5eed-5a4a-434b-9abf-0da8e2dbb29a'::uuid, 'game'),
    ('56d2021a-ef13-4786-a73a-9009ecaa3d50'::uuid, 'portfolio'),
    ('efa267b3-af0c-4479-93f6-d9a0a327f75c'::uuid, 'portfolio'),
    ('886f8636-5ac4-480d-a530-0dbd2534b011'::uuid, 'registration'),
    ('5740ed7d-d63f-4280-8650-0c9d7b53171d'::uuid, 'registration'),
    ('b63415d8-ddba-42de-9ec8-953b8979f3bb'::uuid, 'drawer'),
    ('1fe9c974-6516-4c4b-82e1-1878625842dd'::uuid, 'drawer'),
    ('2c708a60-afdb-4cbf-84e2-f5e91752f655'::uuid, 'drawer'),
    ('bfb4714f-0e3f-4ab1-8375-eea21ac21ee6'::uuid, 'drawer'),
    ('f5fab511-9778-43aa-8b60-eacf89a98c93'::uuid, 'account'),
    ('46ef4558-ef63-4eec-857b-1bf7549f9188'::uuid, 'account'),
    ('4851266c-e1c9-48e2-8709-905ddde9ddfa'::uuid, 'account')
)
update public.review_threads as thread
set
  page_hash = '#pages',
  page_state = jsonb_build_object(
    'active_controls',
    jsonb_build_array(
      '[data-flat-device="mobile"]',
      format('[data-flat-doc="%s"]', legacy_tabs.doc_key)
    ),
    'open_details',
    '[]'::jsonb
  )
from legacy_tabs
where thread.id = legacy_tabs.id
  and thread.page_state = '{}'::jsonb;
