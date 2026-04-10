import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// 컨트롤러: 비즈니스 로직(데이터 취득 및 상태 관리) 담당
import '../../controller/auth/login_controller.dart';
import '../../controller/notice_controller.dart';
import '../../controller/event_controller.dart';

// 공통 위젯: UI 일관성을 위한 커스텀 위젯들
import '../../widget/common/section_header.dart';
import '../../widget/common/library_card_tile.dart';
import '../../widget/common/loading_widget.dart';

/// [HomeTab]
/// 앱의 메인 화면으로 배너, 공지사항/이벤트 미리보기를 제공합니다.
/// 자동 슬라이드 타이머 제어를 위해 StatefulWidget으로 구현되었습니다.
class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  // 배너 슬라이드 제어를 위한 컨트롤러와 타이머
  final PageController _bannerController = PageController();
  Timer? _bannerTimer;
  int _bannerIndex = 0; // 현재 보고 있는 배너 번호

  // 배너에 표시될 정적 데이터 리스트 (추후 DB 연동 가능)
  static const List<_BannerData> _banners = [
    _BannerData(
      color: Color(0xFF1565C0),
      icon: Icons.local_library,
      title: '부산 도서관에 오신 것을\n환영합니다',
      subtitle: '다양한 도서와 서비스를 이용해보세요',
    ),
    _BannerData(
      color: Color(0xFF2E7D32),
      icon: Icons.event,
      title: '이번 달 특별 행사',
      subtitle: '독서 토론, 작가 강연 등 다채로운 프로그램',
    ),
    _BannerData(
      color: Color(0xFF6A1B9A),
      icon: Icons.auto_awesome,
      title: 'AI 도서 추천 서비스',
      subtitle: '취향에 맞는 도서를 AI가 추천해드립니다',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _startBannerTimer(); // 자동 슬라이드 시작

    // 위젯 빌드 완료 후 데이터를 불러오기 위해 microtask 사용 (프레임 드랍 방지)
    Future.microtask(() {
      if (!mounted) return;
      context.read<NoticeController>().fetchNotices(); // 공지사항 로드
      context.read<EventController>().fetchEvents();   // 이벤트 로드
    });
  }

  /// 3초마다 배너를 다음 페이지로 넘기는 타이머 설정
  void _startBannerTimer() {
    _bannerTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!mounted) return; // 위젯이 사라졌다면 실행 안 함
      final next = (_bannerIndex + 1) % _banners.length; // 마지막 페이지면 처음으로 순환
      _bannerController.animateToPage(
        next,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    // 메모리 누수 방지: 타이머와 컨트롤러는 반드시 해제해야 합니다.
    _bannerTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 로그인 여부에 따라 UI가 실시간으로 변하도록 watch 사용
    final isLoggedIn = context.watch<LoginController>().isLoggedIn;

    return RefreshIndicator(
      // 당겨서 새로고침 로직
      onRefresh: () async {
        await context.read<NoticeController>().fetchNotices();
        await context.read<EventController>().fetchEvents();
      },
      child: ListView(
        children: [
          // ── [섹션 1] 배너 PageView ─────────────────────────────
          SizedBox(
            height: 180,
            child: Stack(
              children: [
                PageView.builder(
                  controller: _bannerController,
                  itemCount: _banners.length,
                  onPageChanged: (i) => setState(() => _bannerIndex = i),
                  itemBuilder: (_, i) => _BannerCard(data: _banners[i]),
                ),
                // 배너 하단 점(Indicator) 표시 부분
                Positioned(
                  bottom: 10,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _banners.length,
                          (i) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: _bannerIndex == i ? 20 : 8, // 현재 페이지는 길게 표시
                        height: 8,
                        decoration: BoxDecoration(
                          color: _bannerIndex == i ? Colors.white : Colors.white54,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── [섹션 2] 비로그인 상태 안내 카드 ─────────────────────────────
          if (!isLoggedIn) ...[
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Text('서비스를 이용하려면 로그인하세요.', style: TextStyle(fontSize: 15)),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => Navigator.pushNamed(context, '/login'),
                              child: const Text('로그인'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.pushNamed(context, '/signup'),
                              child: const Text('회원 가입'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],

          // ── [섹션 3] 공지사항 미리보기 (최신 3건) ─────────────────────────
          SectionHeader(
            title: '공지사항',
            onMoreTap: () => Navigator.pushNamed(context, '/noticeList'),
          ),
          Consumer<NoticeController>(
            builder: (_, ctrl, __) {
              if (ctrl.isLoading) return const LoadingWidget();
              if (ctrl.noticeList.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Center(child: Text('공지사항이 없습니다.', style: TextStyle(color: Colors.grey))),
                );
              }
              // 리스트 중 앞의 3개만 잘라서 표시
              final preview = ctrl.noticeList.take(3).toList();
              return Column(
                children: preview
                    .map((n) => LibraryCardTile(
                  leadingIcon: Icons.campaign_outlined,
                  iconColor: Colors.indigo,
                  title: n.title ?? '공지',
                  subtitle: n.regDate,
                  trailingText: '조회 ${n.viewCount ?? 0}',
                  onTap: () => Navigator.pushNamed(context, '/noticeDetail', arguments: n.id),
                ))
                    .toList(),
              );
            },
          ),

          // ── [섹션 4] 이벤트 / 행사 미리보기 (최신 3건) ───────────────────────────
          SectionHeader(
            title: '이벤트 / 행사',
            onMoreTap: () => Navigator.pushNamed(context, '/eventList'),
          ),
          Consumer<EventController>(
            builder: (_, ctrl, __) {
              if (ctrl.isLoading) return const LoadingWidget();
              if (ctrl.eventList.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Center(child: Text('등록된 행사가 없습니다.', style: TextStyle(color: Colors.grey))),
                );
              }
              final preview = ctrl.eventList.take(3).toList();
              return Column(
                children: preview
                    .map((e) => LibraryCardTile(
                  leadingIcon: Icons.celebration_outlined,
                  iconColor: Colors.orange,
                  title: e.title ?? '행사',
                  subtitle: e.eventDate,
                  onTap: () => Navigator.pushNamed(context, '/eventDetail', arguments: e.id),
                ))
                    .toList(),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

/// 배너 개별 카드 위젯 (UI 전용 분리)
class _BannerCard extends StatelessWidget {
  final _BannerData data;
  const _BannerCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [data.color, data.color.withOpacity(0.75)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Icon(data.icon, size: 64, color: Colors.white70),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(data.title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        height: 1.4)),
                const SizedBox(height: 8),
                Text(data.subtitle, style: const TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 배너용 데이터 모델 (간단하게 내부에서만 사용)
class _BannerData {
  final Color color;
  final IconData icon;
  final String title;
  final String subtitle;
  const _BannerData({
    required this.color,
    required this.icon,
    required this.title,
    required this.subtitle
  });
}