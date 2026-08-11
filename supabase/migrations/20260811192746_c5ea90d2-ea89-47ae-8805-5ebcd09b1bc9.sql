
CREATE POLICY "site images readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');
CREATE POLICY "site images admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "site images admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "site images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "admission docs upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'admission-docs');
CREATE POLICY "admission docs staff read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'admission-docs' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher')));
CREATE POLICY "admission docs admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'admission-docs' AND public.has_role(auth.uid(),'admin'));
