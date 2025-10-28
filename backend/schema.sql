--
-- PostgreSQL database dump
--

\restrict bC42kd4qkGQ2Pq9K9NTjgICmAiKUIO50Ic1aI80K2qeZOOWCPWuojvvb0fVJoPd

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2025-10-27 15:02:38 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16390)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 234 (class 1255 OID 16417)
-- Name: update_last_update_column(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.update_last_update_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_last_update_column() OWNER TO devuser;

--
-- TOC entry 236 (class 1255 OID 24706)
-- Name: update_pro_boxes_last_update(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.update_pro_boxes_last_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_pro_boxes_last_update() OWNER TO devuser;

--
-- TOC entry 235 (class 1255 OID 24688)
-- Name: update_users_boxes_last_update(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.update_users_boxes_last_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_users_boxes_last_update() OWNER TO devuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 24648)
-- Name: balance; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.balance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    last_update timestamp with time zone DEFAULT now(),
    created timestamp with time zone DEFAULT now(),
    deleted timestamp with time zone
);


ALTER TABLE public.balance OWNER TO devuser;

--
-- TOC entry 220 (class 1259 OID 24633)
-- Name: balance_history; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.balance_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    add numeric(12,2) DEFAULT 0,
    subtract numeric(12,2) DEFAULT 0,
    title character varying(255) NOT NULL,
    last_update timestamp with time zone DEFAULT now(),
    created timestamp with time zone DEFAULT now(),
    deleted timestamp with time zone
);


ALTER TABLE public.balance_history OWNER TO devuser;

--
-- TOC entry 223 (class 1259 OID 24690)
-- Name: pro_boxes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.pro_boxes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pro_id uuid NOT NULL,
    number integer,
    type integer,
    clean integer DEFAULT 0,
    dirty integer DEFAULT 0,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted timestamp without time zone
);


ALTER TABLE public.pro_boxes OWNER TO devuser;

--
-- TOC entry 219 (class 1259 OID 24613)
-- Name: professionnal; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.professionnal (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(200),
    password character varying(255),
    code character varying(20),
    admin boolean DEFAULT false,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted boolean DEFAULT false,
    verified boolean DEFAULT false,
    CONSTRAINT professionnal_code_check CHECK (((code)::text ~ '^[0-9]+$'::text))
);


ALTER TABLE public.professionnal OWNER TO devuser;

--
-- TOC entry 216 (class 1259 OID 16401)
-- Name: users; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    password character varying(255),
    code character varying(20),
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted boolean DEFAULT false,
    verified boolean DEFAULT false,
    CONSTRAINT users_code_check CHECK (((code)::text ~ '^[0-9]+$'::text))
);


ALTER TABLE public.users OWNER TO devuser;

--
-- TOC entry 222 (class 1259 OID 24662)
-- Name: users_boxes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.users_boxes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    borrowed_pro_id uuid,
    give_back_pro_id uuid,
    number integer,
    type integer,
    borrowed timestamp without time zone,
    give_back timestamp without time zone,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted timestamp without time zone
);


ALTER TABLE public.users_boxes OWNER TO devuser;

--
-- TOC entry 218 (class 1259 OID 16422)
-- Name: verification; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.verification (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    code character varying(4) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    verified boolean DEFAULT false
);


ALTER TABLE public.verification OWNER TO devuser;

--
-- TOC entry 217 (class 1259 OID 16421)
-- Name: verification_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.verification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_id_seq OWNER TO devuser;

--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 217
-- Name: verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.verification_id_seq OWNED BY public.verification.id;


--
-- TOC entry 3307 (class 2604 OID 16425)
-- Name: verification id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification ALTER COLUMN id SET DEFAULT nextval('public.verification_id_seq'::regclass);


--
-- TOC entry 3356 (class 2606 OID 24642)
-- Name: balance_history balance_history_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT balance_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3358 (class 2606 OID 24656)
-- Name: balance balance_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.balance
    ADD CONSTRAINT balance_pkey PRIMARY KEY (id);


--
-- TOC entry 3366 (class 2606 OID 24699)
-- Name: pro_boxes pro_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.pro_boxes
    ADD CONSTRAINT pro_boxes_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 24628)
-- Name: professionnal professionnal_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.professionnal
    ADD CONSTRAINT professionnal_email_key UNIQUE (email);


--
-- TOC entry 3354 (class 2606 OID 24626)
-- Name: professionnal professionnal_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.professionnal
    ADD CONSTRAINT professionnal_pkey PRIMARY KEY (id);


--
-- TOC entry 3363 (class 2606 OID 24669)
-- Name: users_boxes users_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users_boxes
    ADD CONSTRAINT users_boxes_pkey PRIMARY KEY (id);


--
-- TOC entry 3339 (class 2606 OID 16414)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3341 (class 2606 OID 16412)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3345 (class 2606 OID 16431)
-- Name: verification verification_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_email_key UNIQUE (email);


--
-- TOC entry 3347 (class 2606 OID 16429)
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- TOC entry 3364 (class 1259 OID 24705)
-- Name: idx_pro_boxes_pro_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_pro_boxes_pro_id ON public.pro_boxes USING btree (pro_id);


--
-- TOC entry 3348 (class 1259 OID 24629)
-- Name: idx_professionnal_deleted; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_professionnal_deleted ON public.professionnal USING btree (deleted) WITH (fillfactor='100', deduplicate_items='true');


--
-- TOC entry 3349 (class 1259 OID 24630)
-- Name: idx_professionnal_email; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_professionnal_email ON public.professionnal USING btree (email) WITH (fillfactor='100', deduplicate_items='true');


--
-- TOC entry 3350 (class 1259 OID 24631)
-- Name: idx_professionnal_verified; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_professionnal_verified ON public.professionnal USING btree (verified) WITH (fillfactor='100', deduplicate_items='true');


--
-- TOC entry 3359 (class 1259 OID 24686)
-- Name: idx_users_boxes_borrowed_pro_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_boxes_borrowed_pro_id ON public.users_boxes USING btree (borrowed_pro_id);


--
-- TOC entry 3360 (class 1259 OID 24687)
-- Name: idx_users_boxes_give_back_pro_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_boxes_give_back_pro_id ON public.users_boxes USING btree (give_back_pro_id);


--
-- TOC entry 3361 (class 1259 OID 24685)
-- Name: idx_users_boxes_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_boxes_user_id ON public.users_boxes USING btree (user_id);


--
-- TOC entry 3335 (class 1259 OID 16416)
-- Name: idx_users_deleted; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_deleted ON public.users USING btree (deleted);


--
-- TOC entry 3336 (class 1259 OID 16415)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3337 (class 1259 OID 16420)
-- Name: idx_users_verified; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_verified ON public.users USING btree (verified);


--
-- TOC entry 3342 (class 1259 OID 16433)
-- Name: idx_verification_code; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_verification_code ON public.verification USING btree (code);


--
-- TOC entry 3343 (class 1259 OID 16432)
-- Name: idx_verification_email; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_verification_email ON public.verification USING btree (email);


--
-- TOC entry 3376 (class 2620 OID 24707)
-- Name: pro_boxes trigger_update_pro_boxes_last_update; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER trigger_update_pro_boxes_last_update BEFORE UPDATE ON public.pro_boxes FOR EACH ROW EXECUTE FUNCTION public.update_pro_boxes_last_update();


--
-- TOC entry 3375 (class 2620 OID 24689)
-- Name: users_boxes trigger_update_users_boxes_last_update; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER trigger_update_users_boxes_last_update BEFORE UPDATE ON public.users_boxes FOR EACH ROW EXECUTE FUNCTION public.update_users_boxes_last_update();


--
-- TOC entry 3374 (class 2620 OID 24632)
-- Name: professionnal update_professionnal_last_update; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_professionnal_last_update BEFORE UPDATE ON public.professionnal FOR EACH ROW EXECUTE FUNCTION public.update_last_update_column();


--
-- TOC entry 3373 (class 2620 OID 16418)
-- Name: users update_users_last_update; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_users_last_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_last_update_column();


--
-- TOC entry 3372 (class 2606 OID 24700)
-- Name: pro_boxes fk_pro_boxes_professional; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.pro_boxes
    ADD CONSTRAINT fk_pro_boxes_professional FOREIGN KEY (pro_id) REFERENCES public.professionnal(id) ON DELETE CASCADE;


--
-- TOC entry 3367 (class 2606 OID 24643)
-- Name: balance_history fk_user; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3368 (class 2606 OID 24657)
-- Name: balance fk_user_balance; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.balance
    ADD CONSTRAINT fk_user_balance FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3369 (class 2606 OID 24675)
-- Name: users_boxes fk_users_boxes_borrowed_pro; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users_boxes
    ADD CONSTRAINT fk_users_boxes_borrowed_pro FOREIGN KEY (borrowed_pro_id) REFERENCES public.professionnal(id) ON DELETE SET NULL;


--
-- TOC entry 3370 (class 2606 OID 24680)
-- Name: users_boxes fk_users_boxes_give_back_pro; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users_boxes
    ADD CONSTRAINT fk_users_boxes_give_back_pro FOREIGN KEY (give_back_pro_id) REFERENCES public.professionnal(id) ON DELETE SET NULL;


--
-- TOC entry 3371 (class 2606 OID 24670)
-- Name: users_boxes fk_users_boxes_user; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users_boxes
    ADD CONSTRAINT fk_users_boxes_user FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-10-27 15:02:39 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict bC42kd4qkGQ2Pq9K9NTjgICmAiKUIO50Ic1aI80K2qeZOOWCPWuojvvb0fVJoPd

