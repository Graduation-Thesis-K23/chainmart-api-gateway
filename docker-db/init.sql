PGDMP         %                {            hiepnguyen6014    15.2    15.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16384    hiepnguyen6014    DATABASE     y   CREATE DATABASE hiepnguyen6014 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE hiepnguyen6014;
                hiepnguyen6014    false            �            1259    16385    users    TABLE     T   CREATE TABLE public.users (
    id bigint NOT NULL,
    username bigint NOT NULL
);
    DROP TABLE public.users;
       public         heap    hiepnguyen6014    false                      0    16385    users 
   TABLE DATA           -   COPY public.users (id, username) FROM stdin;
    public          hiepnguyen6014    false    214   ,       |           2606    16389    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            hiepnguyen6014    false    214                  x�3�4����� ]     