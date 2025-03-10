import { Elysia, error, t } from 'elysia';
import { ADMIN_USERID, getUser } from '../libraries/user';
import { PostSchema } from '../libraries/schema';

const app = new Elysia({ prefix: '/notifications', tags: ['공지'] })
	.get(
		'/',
		async () => {
			return (await PostSchema.find().sort({ date: -1 }).exec()).map((v) => {
				return {
					id: v._id.toString(),
					date: (v.date ?? new Date()).toISOString(),
					title: v.title ?? '',
					content: v.content ?? '',
				};
			});
		},
		{
			query: t.Object({}),
			response: {
				200: t.Array(
					t.Object({
						id: t.String({ description: '공지 ID', default: '60c1c7f9e0f1e7b0b0a9b5b9' }),
						title: t.String({ description: '공지 제목', default: '제목' }),
						content: t.String({ description: '공지 내용', default: '내용' }),
						date: t.String({ description: '공지 날짜', default: '2025-03-08T05:52:06.583Z' }),
					}),
					{ description: '공지 목록' }
				),
				400: t.Object({ message: t.String() }, { description: '에러 메시지' }),
			},
			detail: { summary: '공지 목록' },
		}
	)
	.post(
		'/',
		async ({ headers, body }) => {
			const { token } = headers;
			const { title, content, date } = body;
			if (!token) throw error(400, { message: '토큰을 입력해주세요.' });
			if (!title) throw error(400, { message: '제목을 입력해주세요.' });
			if (!content) throw error(400, { message: '내용을 입력해주세요.' });
			if (!date) throw error(400, { message: '날짜를 입력해주세요.' });

			let userid: string;
			try {
				userid = await getUser(token);
			} catch (e) {
				if (e === TypeError) {
					throw error(401, { message: '토큰이 유효하지 않습니다.' });
				}
				const err = e as Error;
				if (err.message.startsWith('Wrong number of segments in token:')) {
					throw error(401, { message: '토큰이 유효하지 않습니다.' });
				}
				console.error(e);
				throw e;
			}

			if (!ADMIN_USERID.includes(userid)) {
				throw error(403, { message: '권한이 없습니다.' });
			}

			new PostSchema({ title, content, date }).save();
		},
		{
			headers: t.Object({
				token: t.String({ description: '구글 OAuth 토큰' }),
			}),
			body: t.Object({
				title: t.String({ description: '공지 제목', default: 'title' }),
				content: t.String({ description: '공지 내용', default: 'description' }),
				date: t.String({ description: '공지 날짜', default: '2025-03-08T05:52:06.583Z' }),
			}),
			response: {
				200: t.Object({}),
				400: t.Object({ message: t.String() }, { description: '에러 메시지' }),
				401: t.Object({ message: t.String() }),
				403: t.Object({ message: t.String() }),
			},
			detail: { summary: '공지 추가' },
		}
	);

export default app;
